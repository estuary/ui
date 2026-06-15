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

import { createServer } from 'node:http';

import Anthropic from '@anthropic-ai/sdk';
import {
    AnthropicAdapter,
    CopilotRuntime,
    GoogleGenerativeAIAdapter,
    copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';

const PORT = Number(process.env.COPILOT_RUNTIME_PORT ?? 4000);
const ENDPOINT = '/copilotkit';
// Vite dev server origin allowed to call this runtime.
const ALLOWED_ORIGIN =
    process.env.COPILOT_ALLOWED_ORIGIN ?? 'http://localhost:3000';

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

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(
        `CopilotKit runtime listening on http://localhost:${PORT}${ENDPOINT}`
    );
    console.log(`Provider: ${provider} | Model: ${modelLabel}`);
});
