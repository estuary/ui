import type { LoggerAdapter } from 'react-semantic-tree';
import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { Branch, consoleLogAdapter, SemanticConfig } from 'react-semantic-tree';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { createSemanticEventBatcher } from 'src/services/semanticEventBatcher';

const eventsEndpoint =
    'https://923f8f7f1f9b4bb4-8080.reactor.gcp-us-central1-c2.dp.estuary-data.com/estuary/greg/ui_events/webhook-data';

const eventBatcher = createSemanticEventBatcher(eventsEndpoint);

const adapter: LoggerAdapter = (path, metadata) => {
    const { origin, pathname, search } = window.location;
    const eventMetadata = {
        ...metadata,
        origin,
        pathname,
        search,
        user_id: useUserStore.getState().user?.id ?? null,
    };

    consoleLogAdapter(path, eventMetadata);
    eventBatcher.enqueue({
        ...eventMetadata,
        path,
        timestamp: new Date().toISOString(),
    });
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
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') eventBatcher.flush();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('pagehide', eventBatcher.flush);
        return () => {
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange
            );
            window.removeEventListener('pagehide', eventBatcher.flush);
            eventBatcher.flush();
        };
    }, []);

    return (
        <SemanticConfig adapter={adapter} events={events}>
            <Branch label="Estuary">{children}</Branch>
        </SemanticConfig>
    );
}
