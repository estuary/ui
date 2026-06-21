// Local-only CopilotKit runtime for the in-dashboard assistant demo.
//
// This is a throwaway dev process — it is NOT part of the Vite SPA and is not
// deployed. It holds the LLM key server-side and proxies chat requests from the
// browser to the model via CopilotKit's runtime + a service adapter.
//
// Provider is auto-selected: if GEMINI_API_KEY / GOOGLE_API_KEY is set it uses
// Gemini, otherwise Anthropic. Force one with COPILOT_PROVIDER=google|anthropic.
//
// Run it alongside `npm start`:
//   npm run dev:copilot
//   (= node --env-file=dev/copilot-runtime/.env dev/copilot-runtime/server.mjs)
//
// The frontend points at it via VITE_COPILOT_RUNTIME_URL (default
// http://localhost:4000/copilotkit) and is provider-agnostic.

// Must be first: patches global fetch to sanitize Anthropic requests (dedupe
// tool_use ids / disable parallel tool calls) before any adapter captures fetch.
import './patch-fetch.mjs';

import { createServer } from 'node:http';

import Anthropic from '@anthropic-ai/sdk';
import {
    AnthropicAdapter,
    CopilotRuntime,
    GoogleGenerativeAIAdapter,
    copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import pg from 'pg';

const PORT = Number(process.env.COPILOT_RUNTIME_PORT ?? 4000);
const ENDPOINT = '/copilotkit';
// Vite dev server origin allowed to call this runtime.
const ALLOWED_ORIGIN =
    process.env.COPILOT_ALLOWED_ORIGIN ?? 'http://localhost:3000';

// Kapa knowledge retrieval via its server-side Query API. The runtime holds the
// API key and proxies questions from the browser (the `searchEstuaryKnowledge`
// action), so the key never reaches the SPA. All three values come from the Kapa
// dashboard's Query API integration. If any is unset, the /kapa endpoint reports
// it's not configured rather than failing the whole runtime — the rest of the
// assistant still works.
//
// (The Hosted MCP Server is the eventual target — auto-registered tool, raw
// chunks — but its endpoint is OAuth-only today, which a headless runtime can't
// satisfy with a static key. Switch back once it offers API-key auth.)
const KAPA_API_KEY = process.env.KAPA_API_KEY;
const KAPA_PROJECT_ID = process.env.KAPA_PROJECT_ID;
const KAPA_INTEGRATION_ID = process.env.KAPA_INTEGRATION_ID;
const kapaConfigured = Boolean(
    KAPA_API_KEY && KAPA_PROJECT_ID && KAPA_INTEGRATION_ID
);

// Reads and JSON-parses a request body. Resolves {} for an empty body.
function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (!raw) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(raw));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

const GOOGLE_API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

// Explicit override wins; otherwise pick by whichever key is present.
const provider =
    process.env.COPILOT_PROVIDER ?? (GOOGLE_API_KEY ? 'google' : 'anthropic');

let serviceAdapter;
let modelLabel;

if (provider === 'google') {
    if (!GOOGLE_API_KEY) {
        console.error(
            'GEMINI_API_KEY (or GOOGLE_API_KEY) is not set. Add it to dev/copilot-runtime/.env (see .env.example).'
        );
        process.exit(1);
    }

    // CopilotKit's GoogleGenerativeAIAdapter doesn't reliably forward its
    // `apiKey` option to the underlying LangChain/Gemini client, which reads
    // the key from these env vars — so set them explicitly.
    process.env.GOOGLE_API_KEY = GOOGLE_API_KEY;
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = GOOGLE_API_KEY;

    modelLabel = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
    serviceAdapter = new GoogleGenerativeAIAdapter({
        model: modelLabel,
        apiKey: GOOGLE_API_KEY,
    });
} else {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error(
            'ANTHROPIC_API_KEY is not set. Add it to dev/copilot-runtime/.env (see .env.example).'
        );
        process.exit(1);
    }

    // CopilotKit's AnthropicAdapter reads `baseURL` off the official
    // @anthropic-ai/sdk client (which is `https://api.anthropic.com`, NO /v1)
    // and hands it to @ai-sdk/anthropic, which appends `/messages` — yielding
    // `https://api.anthropic.com/messages` → 404. The two libs disagree on
    // whether /v1 lives in the base URL. Pass a client whose baseURL already
    // includes /v1 so the resolved endpoint is `/v1/messages`.
    modelLabel = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';
    serviceAdapter = new AnthropicAdapter({
        model: modelLabel,
        anthropic: new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
            baseURL: 'https://api.anthropic.com/v1',
        }),
    });
}

const runtime = new CopilotRuntime();

const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: ENDPOINT,
    runtime,
    serviceAdapter,
});

const server = createServer(async (req, res) => {
    // CORS for the cross-origin (3000 -> 4000) dev setup.
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, X-CopilotKit-Runtime-Client-GQL-Version'
    );

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url?.startsWith(ENDPOINT)) {
        await handler(req, res);
        return;
    }

    // Doc-grounding proxy: fetches an Estuary docs page server-side (avoids
    // browser CORS) and returns it as plain text for the assistant to ground on.
    if (req.url?.startsWith('/docs')) {
        const sendJson = (code, body) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(body));
        };

        try {
            const target = new URL(
                req.url,
                `http://localhost:${PORT}`
            ).searchParams.get('url');

            if (!target) {
                sendJson(400, { error: 'Missing ?url= parameter.' });
                return;
            }

            const parsed = new URL(target);
            if (parsed.hostname !== 'docs.estuary.dev') {
                sendJson(403, {
                    error: 'Only docs.estuary.dev URLs are allowed.',
                });
                return;
            }

            const docResponse = await fetch(parsed.href);
            if (!docResponse.ok) {
                sendJson(200, {
                    url: parsed.href,
                    ok: false,
                    status: docResponse.status,
                    error: `Doc fetch failed (${docResponse.status}). Try a different docs.estuary.dev path or fetch the sitemap.`,
                });
                return;
            }

            const html = await docResponse.text();
            const text = html
                .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 12000);

            sendJson(200, { url: parsed.href, ok: true, text });
        } catch (error) {
            sendJson(200, {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return;
    }

    // Kapa knowledge proxy: forwards a question to Kapa's server-side Query API
    // (with the secret X-API-KEY) and returns the grounded answer + sources for
    // the assistant to reason over and cite. Semantic retrieval across Estuary's
    // docs + resolved support history, unlike the /docs proxy (single page).
    if (req.url?.startsWith('/kapa')) {
        const sendJson = (code, body) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(body));
        };

        if (req.method !== 'POST') {
            sendJson(405, {
                error: 'Use POST /kapa with a JSON body { query, threadId? }.',
            });
            return;
        }

        if (!kapaConfigured) {
            sendJson(503, {
                ok: false,
                error: 'Kapa is not configured. Set KAPA_API_KEY, KAPA_PROJECT_ID, and KAPA_INTEGRATION_ID in dev/copilot-runtime/.env (see .env.example).',
            });
            return;
        }

        try {
            const body = await readJsonBody(req);
            const query =
                typeof body.query === 'string' ? body.query.trim() : '';

            if (!query) {
                sendJson(400, { error: 'Missing "query" in request body.' });
                return;
            }

            // A threadId continues an existing Kapa conversation; otherwise
            // start a new thread on the project.
            const kapaEndpoint = body.threadId
                ? `https://api.kapa.ai/query/v1/threads/${encodeURIComponent(
                      body.threadId
                  )}/chat/`
                : `https://api.kapa.ai/query/v1/projects/${encodeURIComponent(
                      KAPA_PROJECT_ID
                  )}/chat/`;

            const kapaResponse = await fetch(kapaEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': KAPA_API_KEY,
                },
                body: JSON.stringify({
                    integration_id: KAPA_INTEGRATION_ID,
                    query,
                }),
            });

            const text = await kapaResponse.text();

            if (!kapaResponse.ok) {
                sendJson(200, {
                    ok: false,
                    status: kapaResponse.status,
                    error: `Kapa query failed (${kapaResponse.status}).`,
                    detail: text.slice(0, 500),
                });
                return;
            }

            const data = JSON.parse(text);
            // Return the grounded answer, its citable sources, and the thread id
            // for follow-ups. (Response shape confirmed against the live API.)
            const rawSources = data.relevant_sources ?? data.sources ?? [];
            sendJson(200, {
                ok: true,
                answer: data.answer ?? null,
                sources: rawSources.map((source) => ({
                    title:
                        source.title ?? source.source_url ?? source.url ?? null,
                    url: source.source_url ?? source.url ?? null,
                })),
                threadId: data.thread_id ?? null,
            });
        } catch (error) {
            sendJson(200, {
                ok: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return;
    }

    // Run-SQL proxy (dev only): executes admin SQL the user reviewed and
    // approved in the assistant's "run setup SQL" card. The browser sends the
    // SQL plus the DB admin credentials the user typed into that card; the
    // runtime connects with the `pg` driver and runs them. Those credentials
    // live only in this request — they are never sent to the LLM. This exists
    // because the browser can't speak the Postgres wire protocol, and the
    // connector runs as a least-privilege user that can't perform these admin
    // operations (CREATE PUBLICATION etc.) itself.
    if (req.url?.startsWith('/run-sql')) {
        const sendJson = (code, body) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(body));
        };

        if (req.method !== 'POST') {
            sendJson(405, {
                error: 'Use POST /run-sql with a JSON body { connection, sql }.',
            });
            return;
        }

        let client;
        try {
            const body = await readJsonBody(req);
            const connection = body.connection ?? {};
            const sql = typeof body.sql === 'string' ? body.sql.trim() : '';

            if (!sql) {
                sendJson(400, { ok: false, error: 'Missing "sql".' });
                return;
            }
            if (!connection.host || !connection.database || !connection.user) {
                sendJson(400, {
                    ok: false,
                    error: 'Connection needs at least host, database, and user.',
                });
                return;
            }

            client = new pg.Client({
                host: connection.host,
                port: Number(connection.port) || 5432,
                database: connection.database,
                user: connection.user,
                password: connection.password,
                connectionTimeoutMillis: 10000,
            });

            await client.connect();
            await client.query(sql);
            sendJson(200, { ok: true });
        } catch (error) {
            sendJson(200, {
                ok: false,
                error: error instanceof Error ? error.message : String(error),
            });
        } finally {
            if (client) {
                await client.end().catch(() => {});
            }
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(
        `CopilotKit runtime listening on http://localhost:${PORT}${ENDPOINT}`
    );
    console.log(`Provider: ${provider} | Model: ${modelLabel}`);
    console.log(
        `Kapa knowledge retrieval: ${
            kapaConfigured ? 'enabled' : 'disabled (set KAPA_* in .env)'
        }`
    );
});
