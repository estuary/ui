import type { StoreWithHydration } from 'src/stores/extensions/Hydration';

export interface WorkflowState extends StoreWithHydration {
    customerId: string;
    hydrateState: () => Promise<void>;
    redirectUrl: string;
    resetState: () => void;
    setCustomerId: (val: WorkflowState['customerId']) => void;
    setRedirectUrl: (val: WorkflowState['redirectUrl']) => void;
}
