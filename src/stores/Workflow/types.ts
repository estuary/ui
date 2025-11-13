import type { ConnectorWithTagQuery } from 'src/api/types';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { StoreWithCollections } from 'src/stores/Workflow/slices/Collections';
import type { StoreWithProjections } from 'src/stores/Workflow/slices/Projections';

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
    connectorMetadata: ConnectorWithTagQuery[];
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
