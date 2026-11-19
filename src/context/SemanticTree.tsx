import type { LoggerAdapter } from 'react-semantic-tree';
import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { Branch, consoleLogAdapter, SemanticConfig } from 'react-semantic-tree';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { captureAnonymousId, getAnonymousId } from 'src/services/anonymousId';
import { createSemanticEventBatcher } from 'src/services/semanticEventBatcher';
import { getAnalyticsEndpoint, isProduction } from 'src/utils/env-utils';

const eventBatcher = createSemanticEventBatcher(getAnalyticsEndpoint());

// Read the marketing handoff at module load, before routing or auth redirects
// can replace the URL.
captureAnonymousId();

const adapter: LoggerAdapter = (labels, metadata) => {
    const {
        origin,
        pathname,
        // search, <--- invite link tokens appear here - don't send
    } = window.location;
    const eventData = {
        origin,
        pathname,
        user_id: useUserStore.getState().user?.id ?? null,
        // Sent alongside user_id after login so the two can be linked.
        anonymous_id: getAnonymousId(),
    };

    if (!isProduction) {
        consoleLogAdapter(labels, { ...eventData, ...metadata });
    }
    eventBatcher.enqueue({
        metadata,
        ...eventData,
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
