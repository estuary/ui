import { useCopilotAction } from '@copilotkit/react-core';

import { getCopilotSettings } from 'src/utils/env-utils';

// The dev runtime exposes a /kapa proxy alongside /copilotkit; derive its URL
// from the runtime URL so it tracks whatever VITE_COPILOT_RUNTIME_URL points at.
const kapaProxyUrl = `${new URL(getCopilotSettings().runtimeUrl).origin}/kapa`;

// Grounds the assistant in Estuary's full knowledge base — product docs plus
// resolved support history — via Kapa's Query API, proxied server-side by the
// runtime (which holds the key). Returns a grounded answer plus source URLs.
// Suits diagnosis and open-ended "how does X work" questions; lookupEstuaryDocs
// (single known page) suits fetching a specific doc whose URL is already known.
export default function KapaActions() {
    useCopilotAction({
        name: 'searchEstuaryKnowledge',
        description:
            "Search Estuary's knowledge base (product docs and resolved support questions) for an answer grounded in real sources. Use this to diagnose errors and explain Estuary/Flow behavior — especially anything you are not fully certain about. Returns { answer, sources }: base your reply on the answer and cite the source URLs. Prefer this over prior knowledge.",
        parameters: [
            {
                name: 'query',
                type: 'string',
                description:
                    'A specific, self-contained question. Example: "Why does source-postgres report that publication flow_publication does not exist, and how do I fix it when connecting as a non-superuser?"',
                required: true,
            },
        ],
        handler: async ({ query }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] searchEstuaryKnowledge', query);

            try {
                const response = await fetch(kapaProxyUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query }),
                });

                return await response.json();
            } catch (error) {
                return {
                    ok: false,
                    error:
                        error instanceof Error ? error.message : String(error),
                };
            }
        },
    });

    return null;
}
