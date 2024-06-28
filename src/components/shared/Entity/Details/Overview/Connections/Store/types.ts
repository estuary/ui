import { EntityNode } from 'api/liveSpecFlows';
import { NodeData } from 'components/graphs/ScopedSystemGraph';
import { CSSProperties } from 'react';
import { Edge, Node, NodeChange } from 'reactflow';

export interface ScopedSystemGraphState {
    nodes: Node[];
    setNode: (value: Node[]) => void;
    setNodeStyle: (value?: CSSProperties) => void;
    onNodeChange: (value: NodeChange[]) => void;

    edges: Edge[];
    setEdge: (value: Edge | Edge[]) => void;

    initGraphElements: (
        childNodes: EntityNode[],
        currentNode: EntityNode,
        parentNodes: EntityNode[]
    ) => void;

    // TODO (scoped system graph): Rename this portion of state to be something more specific to hover/drag.
    currentNode: NodeData | null;
    setCurrentNode: (value: ScopedSystemGraphState['currentNode']) => void;

    searchedNodeId: string | null;
    setSearchedNodeId: (
        value: ScopedSystemGraphState['searchedNodeId']
    ) => void;

    resetState: () => void;
}
