// Local-only CopilotKit runtime for the in-dashboard assistant demo.
//
// This is a throwaway dev process — it is NOT part of the Vite SPA and is not
// deployed. It holds the Anthropic key server-side and proxies chat requests
// from the browser to Claude via CopilotKit's runtime + Anthropic adapter.
//
// Run it alongside `npm start`:
//   node --env-file=dev/copilot-runtime/.env dev/copilot-runtime/server.mjs
//
// The frontend points at it via VITE_COPILOT_RUNTIME_URL (default
// http://localhost:4000/copilotkit). To serve a shared demo instead, swap the
// provider to CopilotKit Cloud (publicApiKey) — see docs/ENV.md.

import { createServer } from 'node:http';

import {
    AnthropicAdapter,
    CopilotRuntime,
    copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';

const PORT = Number(process.env.COPILOT_RUNTIME_PORT ?? 4000);
const ENDPOINT = '/copilotkit';
// Vite dev server origin allowed to call this runtime.
const ALLOWED_ORIGIN = process.env.COPILOT_ALLOWED_ORIGIN ?? 'http://localhost:3000';

if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
        'ANTHROPIC_API_KEY is not set. Add it to dev/copilot-runtime/.env (see .env.example).'
    );
    process.exit(1);
}

// AnthropicAdapter constructs `new Anthropic()` internally, which reads
// ANTHROPIC_API_KEY from the environment.
const serviceAdapter = new AnthropicAdapter({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8',
});
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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CopilotKit-Runtime-Client-GQL-Version');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url?.startsWith(ENDPOINT)) {
        await handler(req, res);
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`CopilotKit runtime listening on http://localhost:${PORT}${ENDPOINT}`);
    console.log(`Model: ${process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8'}`);
});
