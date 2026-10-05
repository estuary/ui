import type { ConnectorTagData } from 'src/context/ConnectorTag';
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
    connectorMetadata: ConnectorTagData | null;
    resetState: () => void;
    setCatalogName: (segments: Partial<CatalogName>) => void;
    setConnectorMetadata: (value: WorkflowState['connectorMetadata']) => void;
    setStorageMappingPrefix: (
        value: WorkflowState['storageMappingPrefix']
    ) => void;
    storageMappingPrefix: string;
}
