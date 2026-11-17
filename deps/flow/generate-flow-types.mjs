// Generates `flow.d.ts` from the JSON schema of Flow catalog specs.
//
// The schema is read from the Flow release pinned below, so regenerating gives
// the same types until the release is bumped. Set FLOW_SCHEMA to a URL or a
// local path (e.g. a checkout's `flow.schema.json`) to read it from elsewhere.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Bump to generate types for a newer Flow release
const FLOW_RELEASE = 'v0.6.15';
const DEFAULT_SCHEMA_URL = `https://raw.githubusercontent.com/estuary/flow/${FLOW_RELEASE}/flow.schema.json`;
const CONVERTER = 'json-schema-to-typescript@15.0.4';

const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), 'flow.d.ts');

const readSchema = async (source) => {
    if (!/^https?:\/\//.test(source)) {
        return JSON.parse(readFileSync(source, 'utf8'));
    }

    const response = await fetch(source);
    if (!response.ok) {
        throw new Error(`Fetching ${source} failed: ${response.status}`);
    }

    return response.json();
};

// Keywords whose values are schemas, maps of schemas, or lists of schemas
const SCHEMA_KEYWORDS = new Set([
    'items',
    'not',
    'if',
    'then',
    'else',
    'contains',
    'propertyNames',
    'additionalItems',
]);
const SCHEMA_MAP_KEYWORDS = new Set([
    'properties',
    '$defs',
    'definitions',
    'patternProperties',
    'dependentSchemas',
]);
const SCHEMA_LIST_KEYWORDS = new Set(['anyOf', 'oneOf', 'allOf', 'prefixItems']);
// Keywords whose values are literal data, not schemas
const LITERAL_KEYWORDS = new Set(['default', 'examples', 'const', 'enum']);

// The converter can't handle boolean schemas, and names types after their
// `title`, which in Flow's schema are sentences rather than names. So boolean
// schemas become their object equivalents, and titles are dropped so types
// are named after their definitions.
const normalize = (schema) => {
    if (typeof schema === 'boolean') {
        return schema ? {} : { not: {} };
    }

    return normalizeKeywords(schema);
};

const normalizeKeywords = (value) => {
    if (Array.isArray(value)) {
        return value.map(normalizeKeywords);
    }
    if (value === null || typeof value !== 'object') {
        return value;
    }

    const result = {};
    for (const [key, child] of Object.entries(value)) {
        if (key === 'title') {
            continue;
        }

        if (LITERAL_KEYWORDS.has(key)) {
            result[key] = child;
        } else if (SCHEMA_KEYWORDS.has(key)) {
            result[key] = normalize(child);
        } else if (SCHEMA_MAP_KEYWORDS.has(key)) {
            result[key] = Object.fromEntries(
                Object.entries(child).map(([name, s]) => [name, normalize(s)])
            );
        } else if (SCHEMA_LIST_KEYWORDS.has(key)) {
            result[key] = child.map(normalize);
        } else {
            result[key] = normalizeKeywords(child);
        }
    }

    return result;
};

const source = process.env.FLOW_SCHEMA ?? DEFAULT_SCHEMA_URL;
const schema = normalize(await readSchema(source));

const types = execFileSync(
    'npx',
    [
        '-y',
        CONVERTER,
        '--no-additionalProperties',
        '--bannerComment',
        `/* Generated from ${source} by \`npm run generate-flow-types\`. Do not edit. */`,
    ],
    { input: JSON.stringify(schema), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }
);

writeFileSync(OUTPUT, types);
console.log(`Wrote ${OUTPUT}`);
