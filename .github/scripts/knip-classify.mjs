#!/usr/bin/env node
// Tag each unused exported symbol in a Knip JSON report with whether it's still
// referenced privately within its own file — beyond its own declaration. This
// separates an *unnecessary export* (used privately — just drop `export`, a
// clean diff) from a *dead exported symbol* (used nowhere — the export was only
// hiding it from the unused-var linter, so delete it).
//
// We parse each file with the TypeScript compiler and ask whether any reference
// to the symbol falls outside its own declaration's subtree. A name-count regex
// can't answer that: it reads a recursive call or a self-referencing type as a
// "use" and mislabels genuinely dead code as merely unnecessary.
//
// Must run while the report's ref is checked out, since it reads source files.
// Rewrites the report in place. Usage: node knip-classify.mjs <report.json>

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.env.GITHUB_WORKSPACE || process.cwd();

// TypeScript ships as CommonJS; import it by absolute path so this script
// resolves it even when run from outside the repo (CI copies it to a temp dir,
// which has no node_modules to walk up into). If TS can't load, leave the report
// unclassified — knip-delta detects that and posts its own alert.
let ts;
try {
    const url = pathToFileURL(
        path.join(REPO, 'node_modules/typescript/lib/typescript.js')
    ).href;
    ts = (await import(url)).default;
} catch {
    process.exit(0);
}

const jsonPath = process.argv[2];
if (!jsonPath) {
    console.error('usage: knip-classify.mjs <report.json>');
    process.exit(1);
}

const SYM = ['exports', 'types', 'nsExports', 'nsTypes'];

let data;
try {
    data = JSON.parse(readFileSync(jsonPath, 'utf8'));
} catch {
    process.exit(0); // nothing to classify; delta script degrades gracefully
}
if (!data || !Array.isArray(data.issues)) process.exit(0);

// Parse each source file once. Returns the SourceFile, or null if unreadable.
const cache = new Map();
const parse = (file) => {
    if (!cache.has(file)) {
        try {
            const text = readFileSync(path.join(REPO, file), 'utf8');
            // Pass the real filename so .tsx is parsed as JSX.
            cache.set(
                file,
                ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
            );
        } catch {
            cache.set(file, null);
        }
    }
    return cache.get(file);
};

// An identifier that names a member/binding rather than *referencing* the
// symbol: the `b` in `a.b`, the key in `{ b: … }`, a class/interface member
// name, an enum member, an import/export specifier. Shorthand `{ b }` is a real
// reference, so it is intentionally not excluded here.
const isNonReference = (id) => {
    const p = id.parent;
    if (!p) return false;
    if (ts.isPropertyAccessExpression(p)) return p.name === id;
    if (ts.isQualifiedName(p)) return p.right === id;
    if (
        ts.isPropertyAssignment(p) ||
        ts.isPropertySignature(p) ||
        ts.isPropertyDeclaration(p) ||
        ts.isMethodSignature(p) ||
        ts.isMethodDeclaration(p) ||
        ts.isGetAccessorDeclaration(p) ||
        ts.isSetAccessorDeclaration(p) ||
        ts.isEnumMember(p) ||
        ts.isImportSpecifier(p) ||
        ts.isExportSpecifier(p)
    )
        return p.name === id;
    return false;
};

// The top-level statement enclosing a node — the declaration's own subtree.
const topLevelStatement = (node, sf) => {
    let n = node;
    while (n.parent && n.parent !== sf) n = n.parent;
    return n;
};

// privateUse: is the symbol referenced anywhere outside its own declaration?
// We find the declaration by the identifier nearest knip's reported `pos`, then
// look for any other reference to the same name outside that declaration's range.
const isPrivatelyUsed = (sf, name, pos) => {
    const refs = [];
    let decl = null;
    let bestDist = Infinity;
    const visit = (node) => {
        if (
            ts.isIdentifier(node) &&
            node.text === name &&
            !isNonReference(node)
        ) {
            const start = node.getStart(sf);
            refs.push(start);
            if (typeof pos === 'number') {
                const dist = Math.abs(start - pos);
                if (dist < bestDist) {
                    bestDist = dist;
                    decl = node;
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);

    // Couldn't anchor to a declaration (missing pos, re-export, generated name):
    // fall back to "more than one reference exists" — imperfect, but no worse
    // than the old count heuristic.
    if (!decl) return refs.length >= 2;

    const stmt = topLevelStatement(decl, sf);
    const lo = stmt.getStart(sf);
    const hi = stmt.getEnd();
    return refs.some((start) => start < lo || start >= hi);
};

for (const issue of data.issues) {
    for (const cat of SYM) {
        for (const s of issue[cat] ?? []) {
            const sf = parse(issue.file);
            s.privateUse = sf
                ? isPrivatelyUsed(sf, String(s.name), s.pos)
                : false;
        }
    }
}

writeFileSync(jsonPath, JSON.stringify(data));
