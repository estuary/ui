import { Core } from 'cytoscape';

export interface ScopedSystemGraphState {
    userZoomingEnabled: boolean;
    setUserZoomingEnabled: (
        cyCore: Core | null,
        value: ScopedSystemGraphState['userZoomingEnabled']
    ) => void;
}
