#!/usr/bin/env node
// Find React component props that are declared (and possibly read internally)
// but that no call site anywhere in `src/` ever passes — so the prop is always
// its default/undefined value in practice. Merges results into an existing Knip
// JSON report (adds an `orphanedProps` array to each file's issue entry) so they
// ride the same base-vs-head ratchet in knip-delta.mjs.
//
// Purely syntactic, like knip-classify.mjs: each file is parsed once with the TS
// compiler and never type-checked. Cross-file resolution (a component's Props
// type living in a sibling `types.ts`) relies on this repo's convention of
// absolute `src/`-rooted imports, so a module specifier maps straight to a file
// path — no tsconfig path aliasing or relative-import resolution needed.
//
// Two passes over every file:
//   1. Declarations — record every interface/type alias, every import, and every
//      component (function/arrow assigned to a Capitalized name) along with its
//      resolved Props member names.
//   2. Usage — walk every JSX element, resolve its tag to a component from pass
//      1, and record which attribute names are actually passed at that site.
//
// A component is skipped entirely (never reported) rather than guessed at when:
//   - its Props type can't be resolved syntactically (generics, mapped/
//     conditional types, a type re-exported through a barrel, etc.)
//   - any call site spreads attributes (`<Foo {...rest} />`) — the spread could
//     supply any prop, so we can't rule any of them out
//   - it has zero call sites — that's a dead component (Knip's job), not an
//     orphaned-prop issue
//
// Must run while the report's ref is checked out, since it reads source files.
// Usage: node orphaned-props.mjs <report.json>

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.env.GITHUB_WORKSPACE || process.cwd();

let ts;
try {
    const url = pathToFileURL(
        path.join(REPO, 'node_modules/typescript/lib/typescript.js')
    ).href;
    ts = (await import(url)).default;
} catch {
    process.exit(0); // leave the report untouched; knip-delta degrades gracefully
}

const jsonPath = process.argv[2];
if (!jsonPath) {
    console.error('usage: orphaned-props.mjs <report.json>');
    process.exit(1);
}

const INDETERMINATE = Symbol('indeterminate');

// ---- File discovery ---------------------------------------------------

const IGNORE_DIRS = new Set(['gql-types']);

function walk(dir, out) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (IGNORE_DIRS.has(entry.name)) continue;
            walk(full, out);
        } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
            out.push(path.relative(REPO, full));
        }
    }
}

const files = [];
walk(path.join(REPO, 'src'), files);

// ---- Parse once, reuse everywhere --------------------------------------

const sourceCache = new Map();
function parse(file) {
    if (!sourceCache.has(file)) {
        try {
            const text = readFileSync(path.join(REPO, file), 'utf8');
            sourceCache.set(
                file,
                ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
            );
        } catch {
            sourceCache.set(file, null);
        }
    }
    return sourceCache.get(file);
}

// ---- Module resolution --------------------------------------------------
// This repo imports almost everything by absolute `src/...` specifier, so a
// module specifier maps directly onto a file path. Anything else (external
// packages, the rare relative import) is left unresolved and simply won't
// match any locally-declared component or type.

const resolveCache = new Map();
function resolveModule(spec) {
    if (!spec.startsWith('src/')) return null;
    if (resolveCache.has(spec)) return resolveCache.get(spec);
    const candidates = [
        `${spec}.ts`,
        `${spec}.tsx`,
        `${spec}/index.ts`,
        `${spec}/index.tsx`,
    ];
    const hit = candidates.find((c) => existsSync(path.join(REPO, c))) ?? null;
    resolveCache.set(spec, hit);
    return hit;
}

// ---- Pass 1: declarations -------------------------------------------------

// file -> Map<localName, {spec, importedName, isDefault}>
const importsByFile = new Map();
// file -> Map<name, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>
const typesByFile = new Map();
// componentKey -> { name, file, declFile, declPos, propsNode, usedProps: Set, hasSpread: bool, callSites: number }
const components = new Map();

function componentKey(file, name) {
    return `${file}#${name}`;
}

function registerComponent(file, name, propsTypeNode, declPos) {
    const key = componentKey(file, name);
    if (components.has(key)) return components.get(key);
    const entry = {
        name,
        file,
        propsTypeNode,
        declPos,
        usedProps: new Set(),
        hasSpread: false,
        callSites: 0,
    };
    components.set(key, entry);
    return entry;
}

// Unwrap `memo(...)` / `forwardRef(...)` (possibly nested) to the inner
// function-like node actually receiving props as its first parameter.
function unwrapComponentWrapper(node) {
    let n = node;
    while (
        ts.isCallExpression(n) &&
        ts.isIdentifier(n.expression) &&
        (n.expression.text === 'memo' || n.expression.text === 'forwardRef') &&
        n.arguments.length > 0
    ) {
        n = n.arguments[0];
    }
    return n;
}

function isCapitalized(name) {
    return /^[A-Z]/.test(name);
}

// Find `FC<Props>` / `FunctionComponent<Props>` / `React.FC<Props>` etc. on a
// variable's own type annotation, when the props type isn't on the parameter.
function propsFromFCAnnotation(typeNode) {
    if (!typeNode || !ts.isTypeReferenceNode(typeNode)) return null;
    const name = ts.isQualifiedName(typeNode.typeName)
        ? typeNode.typeName.right.text
        : typeNode.typeName.text;
    if (
        (name === 'FC' || name === 'FunctionComponent' || name === 'VFC') &&
        typeNode.typeArguments?.length
    ) {
        return typeNode.typeArguments[0];
    }
    return null;
}

function declarationsPass(file, sf) {
    const imports = new Map();
    const types = new Map();
    importsByFile.set(file, imports);
    typesByFile.set(file, types);

    // Track local names, plus which of them (if any) are *also* the file's
    // default export — so we register ONE entry per component and alias the
    // `#default` key to it, rather than creating a second entry object (which
    // would double-count it: `components.values()` would yield the component
    // twice, once per key, if two keys pointed at two different objects).
    const localComponents = new Map(); // name -> {propsNode, pos}
    const defaultAliasNames = new Set();
    let anonymousDefault = null; // {propsNode, pos}, for a nameless default export

    const propsNodeOf = (fnLike) => {
        const params = fnLike.parameters;
        if (params.length < 1 || params.length > 2) return null;
        let propsNode = params[0].type ?? null;
        if (
            !propsNode &&
            fnLike.parent &&
            ts.isVariableDeclaration(fnLike.parent)
        ) {
            propsNode = propsFromFCAnnotation(fnLike.parent.type);
        }
        return propsNode;
    };

    const considerFunctionLike = (name, fnLike, pos) => {
        if (!isCapitalized(name)) return;
        const propsNode = propsNodeOf(fnLike);
        if (!propsNode) return; // no resolvable type info — skip silently
        localComponents.set(name, { propsNode, pos });
    };

    const hasDefaultModifier = (node) => {
        const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
        return Boolean(
            mods?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
        );
    };

    const visit = (node) => {
        if (ts.isImportDeclaration(node) && node.importClause) {
            const spec = node.moduleSpecifier.text;
            const clause = node.importClause;
            if (clause.name) {
                imports.set(clause.name.text, {
                    spec,
                    importedName: 'default',
                    isDefault: true,
                });
            }
            if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
                for (const el of clause.namedBindings.elements) {
                    imports.set(el.name.text, {
                        spec,
                        importedName: (el.propertyName ?? el.name).text,
                        isDefault: false,
                    });
                }
            }
        } else if (ts.isInterfaceDeclaration(node) && node.name) {
            types.set(node.name.text, node);
        } else if (ts.isTypeAliasDeclaration(node) && node.name) {
            types.set(node.name.text, node);
        } else if (ts.isFunctionDeclaration(node)) {
            if (node.name) {
                considerFunctionLike(node.name.text, node, node.name.getStart(sf));
                if (hasDefaultModifier(node)) defaultAliasNames.add(node.name.text);
            } else if (hasDefaultModifier(node)) {
                // `export default function(props: Props) {}` — nameless.
                const propsNode = propsNodeOf(node);
                if (propsNode) anonymousDefault = { propsNode, pos: node.getStart(sf) };
            }
        } else if (ts.isVariableStatement(node)) {
            for (const decl of node.declarationList.declarations) {
                if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
                const init = unwrapComponentWrapper(decl.initializer);
                if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
                    considerFunctionLike(decl.name.text, init, decl.name.getStart(sf));
                }
            }
        } else if (ts.isExportAssignment(node) && !node.isExportEquals) {
            if (ts.isIdentifier(node.expression)) {
                // `export default Foo;` referring to a declaration seen above.
                defaultAliasNames.add(node.expression.text);
            } else {
                // `export default (props: Props) => {...}` — nameless.
                const init = unwrapComponentWrapper(node.expression);
                if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
                    const propsNode = propsNodeOf(init);
                    if (propsNode)
                        anonymousDefault = { propsNode, pos: node.getStart(sf) };
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);

    for (const [name, { propsNode, pos }] of localComponents) {
        const entry = registerComponent(file, name, propsNode, pos);
        if (defaultAliasNames.has(name)) {
            components.set(componentKey(file, 'default'), entry);
        }
    }
    if (anonymousDefault && !components.has(componentKey(file, 'default'))) {
        registerComponent(
            file,
            'default',
            anonymousDefault.propsNode,
            anonymousDefault.pos
        );
    }
}

// ---- Props member resolution ---------------------------------------------

function stringLiteralUnionToSet(node) {
    const out = new Set();
    const collect = (n) => {
        if (ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal)) {
            out.add(n.literal.text);
            return true;
        }
        if (ts.isUnionTypeNode(n)) return n.types.every(collect);
        return false;
    };
    return collect(node) ? out : null;
}

function findNamedType(file, name) {
    const local = typesByFile.get(file)?.get(name);
    if (local) return { file, node: local };
    const imp = importsByFile.get(file)?.get(name);
    if (!imp) return null;
    const target = resolveModule(imp.spec);
    if (!target) return null;
    const targetSf = parse(target);
    if (!targetSf || !typesByFile.has(target)) {
        // Ensure the target has been through the declarations pass.
        if (targetSf && !typesByFile.has(target)) declarationsPass(target, targetSf);
    }
    const node = typesByFile.get(target)?.get(imp.importedName);
    return node ? { file: target, node } : null;
}

function membersOfInterface(file, node, resolving) {
    const own = new Set();
    for (const m of node.members) {
        if (
            (ts.isPropertySignature(m) || ts.isMethodSignature(m)) &&
            (ts.isIdentifier(m.name) || ts.isStringLiteral(m.name))
        ) {
            own.add(m.name.text);
        }
    }
    for (const clause of node.heritageClauses ?? []) {
        for (const expr of clause.types) {
            if (!ts.isIdentifier(expr.expression)) return INDETERMINATE;
            const found = findNamedType(file, expr.expression.text);
            if (!found) return INDETERMINATE;
            const members = resolvePropsMembers(found.file, found.node, resolving);
            if (members === INDETERMINATE) return INDETERMINATE;
            for (const m of members) own.add(m);
        }
    }
    return own;
}

// Resolves a declaration (interface or type alias) to its member-name set.
function resolvePropsMembers(file, declNode, resolving) {
    const key = `${file}#${declNode.name.text}`;
    if (resolving.has(key)) return INDETERMINATE; // cycle guard
    resolving.add(key);
    try {
        if (ts.isInterfaceDeclaration(declNode)) {
            return membersOfInterface(file, declNode, resolving);
        }
        if (ts.isTypeAliasDeclaration(declNode)) {
            return resolvePropsFromTypeNode(file, declNode.type, resolving);
        }
        return INDETERMINATE;
    } finally {
        resolving.delete(key);
    }
}

// Resolves an arbitrary type node (inline literal, named reference, Pick/Omit/
// Partial/Required wrapper, or intersection) to a member-name set.
function resolvePropsFromTypeNode(file, node, resolving) {
    if (!node) return INDETERMINATE;

    if (ts.isTypeLiteralNode(node)) {
        const out = new Set();
        for (const m of node.members) {
            if (
                (ts.isPropertySignature(m) || ts.isMethodSignature(m)) &&
                (ts.isIdentifier(m.name) || ts.isStringLiteral(m.name))
            ) {
                out.add(m.name.text);
            } else {
                return INDETERMINATE; // index signature, mapped type, etc.
            }
        }
        return out;
    }

    if (ts.isIntersectionTypeNode(node)) {
        const out = new Set();
        for (const t of node.types) {
            const members = resolvePropsFromTypeNode(file, t, resolving);
            if (members === INDETERMINATE) return INDETERMINATE;
            for (const m of members) out.add(m);
        }
        return out;
    }

    if (ts.isParenthesizedTypeNode(node)) {
        return resolvePropsFromTypeNode(file, node.type, resolving);
    }

    if (ts.isTypeReferenceNode(node)) {
        if (!ts.isIdentifier(node.typeName)) return INDETERMINATE; // qualified name
        const name = node.typeName.text;

        if (
            (name === 'Partial' || name === 'Required' || name === 'Readonly') &&
            node.typeArguments?.length === 1
        ) {
            return resolvePropsFromTypeNode(file, node.typeArguments[0], resolving);
        }
        if (
            (name === 'Pick' || name === 'Omit') &&
            node.typeArguments?.length === 2
        ) {
            const base = resolvePropsFromTypeNode(
                file,
                node.typeArguments[0],
                resolving
            );
            if (base === INDETERMINATE) return INDETERMINATE;
            const keys = stringLiteralUnionToSet(node.typeArguments[1]);
            if (!keys) return INDETERMINATE;
            const out = new Set();
            for (const m of base) {
                const keep = name === 'Pick' ? keys.has(m) : !keys.has(m);
                if (keep) out.add(m);
            }
            return out;
        }

        const found = findNamedType(file, name);
        if (!found) return INDETERMINATE;
        return resolvePropsMembers(found.file, found.node, resolving);
    }

    return INDETERMINATE; // union, mapped, conditional, indexed access, etc.
}

// ---- Pass 2: usage ---------------------------------------------------------

function hasNonTrivialChildren(jsxElement) {
    return jsxElement.children.some((c) => {
        if (ts.isJsxText(c)) return c.text.trim().length > 0;
        return true; // JsxElement / JsxSelfClosingElement / JsxExpression / JsxFragment
    });
}

function usagePass(file, sf) {
    const imports = importsByFile.get(file);

    const resolveTag = (tagName) => {
        if (!ts.isIdentifier(tagName) || !isCapitalized(tagName.text)) return null;
        const name = tagName.text;
        if (components.has(componentKey(file, name)))
            return componentKey(file, name);
        const imp = imports?.get(name);
        if (!imp) return null;
        const target = resolveModule(imp.spec);
        if (!target) return null;
        const targetName = imp.isDefault ? 'default' : imp.importedName;
        const key = componentKey(target, targetName);
        return components.has(key) ? key : null;
    };

    const recordUsage = (openingLike, key, jsxElementForChildren) => {
        const entry = components.get(key);
        entry.callSites += 1;
        let sawChildrenContent = false;
        for (const attr of openingLike.attributes.properties) {
            if (ts.isJsxSpreadAttribute(attr)) {
                entry.hasSpread = true;
                continue;
            }
            if (ts.isJsxAttribute(attr)) {
                const attrName = attr.name.getText(sf);
                if (attrName === 'children') sawChildrenContent = true;
                entry.usedProps.add(attrName);
            }
        }
        if (
            !sawChildrenContent &&
            jsxElementForChildren &&
            hasNonTrivialChildren(jsxElementForChildren)
        ) {
            entry.usedProps.add('children');
        }
    };

    const visit = (node) => {
        if (ts.isJsxSelfClosingElement(node)) {
            const key = resolveTag(node.tagName);
            if (key) recordUsage(node, key, null);
        } else if (ts.isJsxElement(node)) {
            const key = resolveTag(node.openingElement.tagName);
            if (key) recordUsage(node.openingElement, key, node);
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);
}

// ---- Run --------------------------------------------------------------

for (const file of files) {
    const sf = parse(file);
    if (sf) declarationsPass(file, sf);
}
for (const file of files) {
    const sf = parse(file);
    if (sf) usagePass(file, sf);
}

// ---- Resolve Props members lazily, now that all declarations are known ----

const orphans = []; // { file, name, pos }
// A component can be reachable under more than one key (its own name, plus a
// `#default` alias) but both point at the same entry object — dedupe on that
// object identity so it's evaluated once.
for (const entry of new Set(components.values())) {
    if (entry.callSites === 0 || entry.hasSpread) continue;
    const members = resolvePropsFromTypeNode(entry.file, entry.propsTypeNode, new Set());
    if (members === INDETERMINATE) continue;
    for (const prop of members) {
        if (!entry.usedProps.has(prop)) {
            orphans.push({
                file: entry.file,
                name: `${entry.name === 'default' ? path.basename(entry.file).replace(/\.tsx?$/, '') : entry.name}.${prop}`,
                pos: entry.declPos,
            });
        }
    }
}

// ---- Merge into the Knip-shaped report ------------------------------------

let data;
try {
    data = JSON.parse(readFileSync(jsonPath, 'utf8'));
} catch {
    data = { issues: [] };
}
if (!data || !Array.isArray(data.issues)) data = { issues: [] };

const issueByFile = new Map(data.issues.map((i) => [i.file, i]));
for (const o of orphans) {
    let issue = issueByFile.get(o.file);
    if (!issue) {
        issue = { file: o.file };
        issueByFile.set(o.file, issue);
        data.issues.push(issue);
    }
    (issue.orphanedProps ??= []).push({ name: o.name, pos: o.pos });
}

writeFileSync(jsonPath, JSON.stringify(data));
