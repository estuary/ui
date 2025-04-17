import type { ConnectorWithTagQuery } from 'src/api/connectors';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';

export interface WorkflowState extends StoreWithHydration {
    connectorMetadata: ConnectorWithTagQuery[];
    customerId: string;
    redirectUrl: string;
    resetState: () => void;
    setConnectorMetadata: (val: WorkflowState['connectorMetadata']) => void;
    setCustomerId: (val: WorkflowState['customerId']) => void;
    setRedirectUrl: (val: WorkflowState['redirectUrl']) => void;
}
