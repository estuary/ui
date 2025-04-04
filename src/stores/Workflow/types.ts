import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { BaseComponentProps } from 'src/types';

export interface WorkflowHydratorProps extends BaseComponentProps {
    expressWorkflow?: boolean;
}

export interface WorkflowState extends StoreWithHydration {
    customerId: string;
    hydrateState: () => Promise<void>;
    redirectUrl: string;
    resetState: () => void;
    setCustomerId: (val: WorkflowState['customerId']) => void;
    setRedirectUrl: (val: WorkflowState['redirectUrl']) => void;
}
