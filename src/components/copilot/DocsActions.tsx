import { useCopilotAction } from '@copilotkit/react-core';

import { getCopilotSettings } from 'src/utils/env-utils';

// The dev runtime exposes a /docs proxy alongside /copilotkit; derive its URL
// from the runtime URL so it tracks whatever VITE_COPILOT_RUNTIME_URL points at.
const docsProxyUrl = `${new URL(getCopilotSettings().runtimeUrl).origin}/docs`;

// Grounds the explainer answers (log message, feature/config, connector setup)
// in Estuary's real product docs instead of the model's prior knowledge, by
// fetching docs.estuary.dev pages through the runtime proxy.
export default function DocsActions() {
    useCopilotAction({
        name: 'lookupEstuaryDocs',
        description:
            'Fetch the text of an Estuary product documentation page from docs.estuary.dev to ground an answer about a Flow feature, configuration option, log message, or connector setup. Pass the full docs.estuary.dev URL. For connector setup, use the connector documentation URL from the page context. For concepts, you may first fetch https://docs.estuary.dev/sitemap.xml to find the right page. Prefer grounding answers in fetched docs over prior knowledge.',
        parameters: [
            {
                name: 'url',
                type: 'string',
                description:
                    'Full https://docs.estuary.dev/... URL to fetch (a doc page or sitemap.xml).',
                required: true,
            },
        ],
        handler: async ({ url }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] lookupEstuaryDocs', url);
            try {
                const response = await fetch(
                    `${docsProxyUrl}?url=${encodeURIComponent(url)}`
                );
                return await response.json();
            } catch (error) {
                return {
                    url,
                    error:
                        error instanceof Error ? error.message : String(error),
                };
            }
        },
    });

    return null;
}
