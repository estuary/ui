import { NodeData } from 'components/graphs/ScopedSystemGraph';
import { Core } from 'cytoscape';

export interface ScopedSystemGraphState {
    minZoom: number;
    maxZoom: number;
    zoom: number;
    setZoom: (
        cyCore: Core | null,
        value?: ScopedSystemGraphState['zoom']
    ) => void;

    currentNode: NodeData | null;
    setCurrentNode: (value: ScopedSystemGraphState['currentNode']) => void;

    userZoomingEnabled: boolean;
    setUserZoomingEnabled: (
        cyCore: Core | null,
        value: ScopedSystemGraphState['userZoomingEnabled']
    ) => void;
}
