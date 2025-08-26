import type { ConnectorTag, ConnectorWithTag } from 'src/api/types';

import { useShallow } from 'zustand/react/shallow';

import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { hasLength } from 'src/utils/misc-utils';

export const useWorkflowStore_connectorMetadataProperty = <
    K extends keyof ConnectorWithTag,
>(
    connectorId: string | null | undefined,
    property: K
): ConnectorWithTag[K] | undefined => {
    return useWorkflowStore(
        useShallow((state) => {
            if (!connectorId || !hasLength(state.connectorMetadata)) {
                return undefined;
            }

            return state.connectorMetadata.find(
                (connector) => connector.id === connectorId
            )?.[property];
        })
    );
};

export const useWorkflowStore_connectorTagProperty = <
    K extends keyof ConnectorTag,
>(
    connectorId: string | null | undefined,
    connectorTagId: string | null | undefined,
    property: K
): ConnectorTag[K] | undefined => {
    return useWorkflowStore(
        useShallow((state) => {
            if (!connectorId || !hasLength(state.connectorMetadata)) {
                return undefined;
            }

            return state.connectorMetadata
                .find((connector) => connector.id === connectorId)
                ?.connector_tags.find((tag) => tag.id === connectorTagId)?.[
                property
            ];
        })
    );
};
