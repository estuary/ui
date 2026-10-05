#!/usr/bin/env node
// Diff two Knip JSON reports (base vs head) into a PR "code-health" delta: which
// dead-code issues this PR introduces vs. removes, across the categories Knip
// reports (unused files, exports, dependencies, …).
//
// The comparison is against the PR's base, so the bar ratchets forward on its
// own as main improves — no committed baseline to maintain.
//
// Usage: node knip-delta.mjs <base.json> <head.json> <comment-out.md>
// Always exits 0 (informational). Emits `introduced` / `fixed` as step outputs
// so a future version can gate on `introduced > 0`.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const [, , basePath, headPath, outPath] = process.argv;
const MARKER = '<!-- knip-health -->';
const CAP = 10; // max offenders listed per category before "…and N more"

// Display order + labels for the Knip issue categories we report, using Knip's
// own names. `files` is the file itself being unused; the rest are arrays of
// symbols/names on a file. (unresolved imports and duplicate exports are
// intentionally omitted for now — add here to include them.)
const LABELS = {
    files: 'Unused files',
    exports: 'Unused exports',
    types: 'Unused exported types',
    nsExports: 'Exports in used namespace',
    nsTypes: 'Exported types in used namespace',
    enumMembers: 'Unused exported enum members',
    namespaceMembers: 'Unused exported namespace members',
    dependencies: 'Unused dependencies',
    devDependencies: 'Unused devDependencies',
    optionalPeerDependencies: 'Referenced optional peerDependencies',
    unlisted: 'Unlisted dependencies',
    binaries: 'Unlisted binaries',
};
const RAW_CATS = Object.keys(LABELS);

// One-line explainer per category, shown when its section is expanded.
const EXPLAIN = {
    files: 'File imported nowhere — delete (or import) it.',
    exports:
        'Exported symbol with no references outside its own file — un-export it, or delete it if unused entirely',
    types: 'Exported type with no references outside its own file — un-export it, or delete it if unused entirely',
    nsExports:
        'Symbol only reachable through a namespace import; nothing references it',
    nsTypes:
        'Type only reachable through a namespace import; nothing references it',
    enumMembers: 'An enum member referenced nowhere',
    namespaceMembers: 'A namespace member referenced nowhere',
    dependencies: 'In package.json but never imported',
    devDependencies: 'In package.json devDependencies but never used',
    optionalPeerDependencies:
        'Optional peer dependency in package.json that is actually referenced',
    unlisted: 'Imported but missing from package.json',
    binaries:
        'A binary used in scripts but not provided by any listed dependency',
};

function load(path) {
    try {
        const data = JSON.parse(readFileSync(path, 'utf8'));
        if (!data || !Array.isArray(data.issues)) return null;
        return data;
    } catch {
        return null;
    }
}

// Map every issue to a stable key so we can diff the *sets* (not just counts):
// a PR that fixes one issue and adds another nets zero but still introduced one.
function keyset(report) {
    const map = new Map(); // key -> {cat, file, name}
    for (const issue of report.issues) {
        const file = issue.file ?? '(root)';
        for (const cat of RAW_CATS) {
            for (const entry of issue[cat] ?? []) {
                const name =
                    typeof entry === 'string'
                        ? entry
                        : (entry?.name ?? JSON.stringify(entry));
                const key =
                    cat === 'files'
                        ? `files ${name}`
                        : `${cat} ${file} ${name}`;
                map.set(key, { cat, file, name });
            }
        }
    }
    return map;
}

// Inner text for an offender; wrapped in backticks (monospace) by the caller.
function fmt(entry) {
    return entry.cat === 'files' ? entry.name : `${entry.file} : ${entry.name}`;
}

const base = load(basePath);
const head = load(headPath);

let body;
if (!base || !head) {
    body = `${MARKER}\n## ⚠️ Code Health\n\nCouldn't compute the delta — Knip failed to produce a report on ${!base ? 'the base' : 'this branch'}. (Check the job logs.)`;
    writeFileSync(outPath, body);
    console.log(body);
    process.exit(1);
}

const baseKeys = keyset(base);
const headKeys = keyset(head);
const introduced = [...headKeys]
    .filter(([k]) => !baseKeys.has(k))
    .map(([, v]) => v);
const fixed = [...baseKeys].filter(([k]) => !headKeys.has(k)).map(([, v]) => v);
const carried = [...headKeys] // "old": present in both base and head (total − new)
    .filter(([k]) => baseKeys.has(k))
    .map(([, v]) => v);

const groupByCat = (items) => {
    const m = {};
    for (const i of items) (m[i.cat] ??= []).push(i);
    return m;
};
const newG = groupByCat(introduced);
const fixedG = groupByCat(fixed);
const oldG = groupByCat(carried);

// Offenders go in a blockquote (normal markdown, so both LaTeX math and inline
// code render). A math-colored ± marker gives new = red `+` / gone = green `-`,
// matching the header on BOTH sign and color — which a ```diff block couldn't,
// since its color is tied to the sign. Paths stay monospace via backticks (the
// marker is colored; the path keeps the default code color).
const MARK = {
    new: '$\\textcolor{red}{+}$ ',
    fixed: '$\\textcolor{green}{-}$ ',
    old: '&nbsp;'.repeat(5), // non-breaking spaces: won't collapse in the HTML
};
const blocks = [];
for (const cat of Object.keys(LABELS)) {
    const nw = newG[cat] ?? [];
    const fx = fixedG[cat] ?? [];
    const od = oldG[cat] ?? [];
    const total = nw.length + od.length;
    if (!total && !fx.length) continue;

    const deltas = [];
    if (nw.length) deltas.push(`$\\textcolor{red}{+${nw.length}}$`);
    if (fx.length) deltas.push(`$\\textcolor{green}{-${fx.length}}$`);
    const summary =
        `${total} ${LABELS[cat]}` +
        (deltas.length ? ` ${deltas.join(' ')}` : '');

    const items = [
        ...nw.map((i) => `${MARK.new}\`${fmt(i)}\``),
        ...fx.map((i) => `${MARK.fixed}\`${fmt(i)}\``),
        ...od.map((i) => `${MARK.old}\`${fmt(i)}\``),
    ];
    const lines = items.slice(0, CAP);
    if (items.length > CAP) lines.push(`…and ${items.length - CAP} more`);
    const list = lines.join('\n');

    blocks.push(
        `<details${nw.length ? ' open' : ''}><summary>${summary}</summary>\n\n> ${EXPLAIN[cat]}\n\n${list}\n\n</details>`
    );
}

// ❌ any dead code added or newly orphaned (even if the PR also cleaned some up);
// ✅ only removals; ⚪ no change. (⚠️ is reserved for a failed check, above.)
let emoji, headline;
if (introduced.length > 0) {
    emoji = '❌';
    headline = `Introduces $\\textcolor{red}{${introduced.length}}$ dead-code issue${introduced.length > 1 ? 's' : ''}${fixed.length ? ` (removes $\\textcolor{green}{${fixed.length}}$)` : ''}.`;
} else if (fixed.length > 0) {
    emoji = '✅';
    headline = `Removes $\\textcolor{green}{${fixed.length}}$ dead-code issue${fixed.length > 1 ? 's' : ''}, introduces none.`;
} else {
    emoji = '⚪';
    headline = 'No change to the dead-code surface.';
}

body =
    `${MARKER}\n## ${emoji} Code Health\n\n${headline}\n\n` + blocks.join('\n');

writeFileSync(outPath, body);
console.log(body);

if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, body + '\n');
if (process.env.GITHUB_OUTPUT)
    appendFileSync(
        process.env.GITHUB_OUTPUT,
        `introduced=${introduced.length}\nfixed=${fixed.length}\n`
    );
