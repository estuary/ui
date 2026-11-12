import type { LoggerAdapter } from 'react-semantic-tree';
import type { BaseComponentProps } from 'src/types';

import { Branch, consoleLogAdapter, SemanticConfig } from 'react-semantic-tree';

import { useUserStore } from 'src/context/User/useUserContextStore';

const eventsEndpoint =
    'https://923f8f7f1f9b4bb4-8080.reactor.gcp-us-central1-c2.dp.estuary-data.com/estuary/greg/ui_events/webhook-data';

const adapter: LoggerAdapter = (path, metadata) => {
    const { origin, pathname, search } = window.location;
    const eventMetadata = {
        ...metadata,
        page: `${origin}${pathname}${search}`,
        user_id: useUserStore.getState().user?.id ?? null,
    };

    // uncomment to log events to brwowser console
    consoleLogAdapter(path, eventMetadata);

    const postEvent = async () => {
        try {
            const response = await fetch(eventsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
                keepalive: true,
                body: JSON.stringify({
                    ...eventMetadata,
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
    mount: true,
    unmount: false,
    hover: true,
    focus: true,
    visible: true,
    scrolledAway: false,
};

export function SemanticTreeProvider({ children }: BaseComponentProps) {
    return (
        <SemanticConfig adapter={adapter} events={events}>
            <Branch label="Estuary">{children}</Branch>
        </SemanticConfig>
    );
}
