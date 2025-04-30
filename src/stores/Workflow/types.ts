import type { ConnectorWithTagQuery } from 'src/api/types';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';

interface CatalogName {
    root: string;
    suffix: string;
    tenant: string;
    whole: string;
}

export interface WorkflowState extends StoreWithHydration {
    catalogName: CatalogName;
    connectorMetadata: ConnectorWithTagQuery[];
    customerId: string;
    redirectUrl: string;
    resetState: () => void;
    setCatalogName: (
        segments: { key: keyof CatalogName; value: string }[]
    ) => void;
    setConnectorMetadata: (value: WorkflowState['connectorMetadata']) => void;
    setCustomerId: (value: WorkflowState['customerId']) => void;
    setRedirectUrl: (value: WorkflowState['redirectUrl']) => void;
}
