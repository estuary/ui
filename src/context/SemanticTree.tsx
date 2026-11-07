import type { LoggerAdapter } from 'react-semantic-tree';
import type { BaseComponentProps } from 'src/types';

import { ConfigurationProvider, SemanticBranch } from 'react-semantic-tree';

const eventsEndpoint =
    'https://923f8f7f1f9b4bb4-8080.reactor.gcp-us-central1-c2.dp.estuary-data.com/estuary/greg/ui_events/webhook-data';

const adapter: LoggerAdapter = (path, metadata) => {
    console.log('[Semantic Interaction]', path, metadata);

    const postEvent = async () => {
        try {
            const response = await fetch(eventsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
                keepalive: true,
                body: JSON.stringify({
                    ...metadata,
                    path,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.warn('Could not send semantic interaction event', error);
        }
    };

    void postEvent();
};

// Start with explicit clicks; branches can opt into other events as needed.
const events = {
    click: true,
    mount: false,
    unmount: false,
    hover: false,
    focus: false,
    visible: false,
    scrolledAway: false,
};

export function SemanticTreeProvider({ children }: BaseComponentProps) {
    return (
        <ConfigurationProvider adapter={adapter} events={events}>
            <SemanticBranch label="Estuary">{children}</SemanticBranch>
        </ConfigurationProvider>
    );
}
