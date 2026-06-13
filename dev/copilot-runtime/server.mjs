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

    // AnthropicAdapter constructs `new Anthropic()` internally, which reads
    // ANTHROPIC_API_KEY from the environment.
    modelLabel = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';
    serviceAdapter = new AnthropicAdapter({ model: modelLabel });
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

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(
        `CopilotKit runtime listening on http://localhost:${PORT}${ENDPOINT}`
    );
    console.log(`Provider: ${provider} | Model: ${modelLabel}`);
});
