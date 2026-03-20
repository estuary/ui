import { useWorkflowStore } from 'src/stores/Workflow/Store';

// Returns the title of the connector stored in workflow metadata
export const useWorkflowStore_connectorTitle = (): string | undefined => {
    return useWorkflowStore(
        (state) => state.connectorMetadata?.connector.title ?? undefined
    );
};

// Returns the documentation URL of the connector tag stored in workflow metadata
export const useWorkflowStore_connectorTagDocumentationUrl =
    (): string | undefined => {
        return useWorkflowStore(
            (state) => state.connectorMetadata?.documentationUrl ?? undefined
        );
    };

// Legacy hook names preserved for backward compatibility
// TODO (gql:connector) - update callers to use the new named hooks above
export const useWorkflowStore_connectorMetadataProperty = (
    _connectorId: string | null | undefined,
    _property: string
): string | undefined => {
    return useWorkflowStore(
        (state) => state.connectorMetadata?.connector.title ?? undefined
    );
};

export const useWorkflowStore_connectorTagProperty = (
    _connectorId: string | null | undefined,
    _connectorTagId: string | null | undefined,
    _property: string
): string | undefined => {
    return useWorkflowStore(
        (state) => state.connectorMetadata?.documentationUrl ?? undefined
    );
};
