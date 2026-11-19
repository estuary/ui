import type { LoggerAdapter } from 'react-semantic-tree';
import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { Branch, consoleLogAdapter, SemanticConfig } from 'react-semantic-tree';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { createSemanticEventBatcher } from 'src/services/semanticEventBatcher';
import { getAnalyticsEndpoint, isProduction } from 'src/utils/env-utils';

const eventBatcher = createSemanticEventBatcher(getAnalyticsEndpoint());

const adapter: LoggerAdapter = (labels, metadata) => {
    const {
        origin,
        pathname,
        // search, <--- invite link tokens appear here - don't send
    } = window.location;
    const eventMetadata = {
        ...metadata,
        origin,
        pathname,
        user_id: useUserStore.getState().user?.id ?? null,
    };

    if (!isProduction) {
        consoleLogAdapter(labels, eventMetadata);
    }
    eventBatcher.enqueue({
        ...eventMetadata,
        branches: labels,
        event_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
    });
};

const events = {
    click: true,
    mount: false,
    hover: true,
    focus: false,
    visible: true,
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
