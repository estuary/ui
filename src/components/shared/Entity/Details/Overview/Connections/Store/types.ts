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

    // TODO (scoped system graph): Rename this portion of state to be something more specific to hover/drag.
    currentNode: NodeData | null;
    setCurrentNode: (value: ScopedSystemGraphState['currentNode']) => void;

    searchedNodeId: string | null;
    setSearchedNodeId: (
        value: ScopedSystemGraphState['searchedNodeId']
    ) => void;

    userZoomingEnabled: boolean;
    setUserZoomingEnabled: (
        cyCore: Core | null,
        value: ScopedSystemGraphState['userZoomingEnabled']
    ) => void;
}
