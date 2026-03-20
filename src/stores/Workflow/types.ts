import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { StoreWithCollections } from 'src/stores/Workflow/slices/Collections';
import type { StoreWithProjections } from 'src/stores/Workflow/slices/Projections';
import type { ConnectorTagGqlNode } from 'src/types/gql';

interface CatalogName {
    root: string;
    suffix: string;
    tenant: string;
    whole: string;
}

export interface WorkflowState
    extends StoreWithHydration,
        StoreWithProjections,
        StoreWithCollections {
    catalogName: CatalogName;
    connectorMetadata: ConnectorTagGqlNode | null;
    customerId: string;
    redirectUrl: string;
    resetState: () => void;
    setCatalogName: (segments: Partial<CatalogName>) => void;
    setConnectorMetadata: (value: WorkflowState['connectorMetadata']) => void;
    setCustomerId: (value: WorkflowState['customerId']) => void;
    setRedirectUrl: (value: WorkflowState['redirectUrl']) => void;
    setStorageMappingPrefix: (
        value: WorkflowState['storageMappingPrefix']
    ) => void;
    storageMappingPrefix: string;
}
