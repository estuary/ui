import { EntityNode } from 'api/liveSpecFlows';
import { Relationship } from 'components/graphs/ScopedSystemGraph';
import { eChartsColors } from 'context/Theme';
import produce from 'immer';
import { unionBy } from 'lodash';
import { CSSProperties } from 'react';
import { Edge, Node, Position, addEdge, applyNodeChanges } from 'reactflow';
import { Entity } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { ScopedSystemGraphState } from './types';

const NODE_DISTANCE = 75;

const NODE_STYLE: CSSProperties = {
    fontSize: 10,
    height: 37,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: 200,
};

const getNodeType = (
    relationship: Relationship,
    parentCount?: number,
    childCount?: number
): Node['type'] => {
    if (relationship === 'parent') {
        return 'input';
    }

    if (relationship === 'child') {
        return 'output';
    }

    if (!parentCount || !childCount) {
        return parentCount ? 'output' : 'input';
    }

    return 'default';
};

const getYPosition = (
    count: number,
    index: number,
    selfYPosition: number,
    maxRelationsEven: boolean
): number => {
    if (count === 1) {
        return selfYPosition;
    }

    const yPosition = index * NODE_DISTANCE;

    return maxRelationsEven && yPosition >= selfYPosition
        ? yPosition + NODE_DISTANCE
        : yPosition;
};

const setElements = (
    count: number,
    maxRelationsEven: boolean,
    nodes: EntityNode[],
    selfId: string,
    selfIndex: number,
    isParent?: boolean
): [Node[], Edge[]] => {
    const nodeEls: Node[] = [];
    const edgeEls: Edge[] = [];

    const relationship: Relationship = isParent ? 'parent' : 'child';
    const nodeType = getNodeType(relationship);
    const x = isParent ? 100 : 700;

    nodes.forEach(({ catalog_name, id, spec_type }, index) => {
        const y = getYPosition(count, index, selfIndex, maxRelationsEven);

        nodeEls.push({
            data: {
                label: catalog_name,
                relationship,
                type: spec_type as Entity,
            },
            draggable: true,
            id,
            position: { x, y },
            sourcePosition: Position.Right,
            style: NODE_STYLE,
            targetPosition: Position.Left,
            type: nodeType,
        });

        edgeEls.push({
            animated: true,
            id: `${id}-${selfId}`,
            source: isParent ? id : selfId,
            target: isParent ? selfId : id,
        });
    });

    return [nodeEls, edgeEls];
};

const getInitialStateData = (): Pick<
    ScopedSystemGraphState,
    'currentNode' | 'edges' | 'nodes' | 'searchedNodeId'
> => ({
    currentNode: null,
    edges: [],
    nodes: [],
    searchedNodeId: null,
});

const getInitialState = (
    set: NamedSet<ScopedSystemGraphState>,
    get: StoreApi<ScopedSystemGraphState>['getState']
): ScopedSystemGraphState => ({
    ...getInitialStateData(),

    initGraphElements: (childNodes, currentNode, parentNodes) => {
        const { setEdge, setNode } = get();

        const childCount = childNodes.length;
        const parentCount = parentNodes.length;

        const maxRelationsOfType =
            childCount > parentCount ? childCount : parentCount;

        const maxRelationsEven = maxRelationsOfType % 2 === 0;

        const numberOfRows = maxRelationsEven
            ? maxRelationsOfType + 1
            : maxRelationsOfType;

        const selfYPosition = Math.ceil((numberOfRows - 1) / 2) * NODE_DISTANCE;

        const selfNodeEl: Node[] = [
            {
                data: {
                    label: currentNode.catalog_name,
                    relationship: 'self',
                    type: currentNode.spec_type as Entity,
                },
                id: currentNode.id,
                position: { x: 400, y: selfYPosition },
                sourcePosition: Position.Right,
                style: NODE_STYLE,
                targetPosition: Position.Left,
                type: getNodeType('self', parentCount, childCount),
            },
        ];

        const [parentNodeEls, parentEdgeEls] = setElements(
            parentCount,
            maxRelationsEven,
            parentNodes,
            currentNode.id,
            selfYPosition,
            true
        );

        const [childNodeEls, childEdgeEls] = setElements(
            childCount,
            maxRelationsEven,
            childNodes,
            currentNode.id,
            selfYPosition
        );

        setNode(selfNodeEl.concat(parentNodeEls, childNodeEls));
        setEdge(parentEdgeEls.concat(childEdgeEls));
    },

    onNodeChange: (changes) => {
        const { nodes } = get();

        const updatedNodes = applyNodeChanges(changes, nodes);

        set(
            produce((state: ScopedSystemGraphState) => {
                state.nodes = updatedNodes;
            }),
            false,
            'node change processed'
        );
    },

    setCurrentNode: (value) => {
        set(
            produce((state: ScopedSystemGraphState) => {
                state.currentNode = value;
            }),
            false,
            'current node updated'
        );
    },

    setEdge: (value) => {
        set(
            produce((state: ScopedSystemGraphState) => {
                state.edges = Array.isArray(value)
                    ? unionBy(state.edges, value, 'id')
                    : addEdge(value, state.edges);
            }),
            false,
            'Edge set'
        );
    },

    setNode: (values) => {
        set(
            produce((state: ScopedSystemGraphState) => {
                state.nodes = unionBy(state.nodes, values, 'id');
            }),
            false,
            'Nodes set'
        );
    },

    setNodeStyle: (value) => {
        const { nodes, searchedNodeId } = get();

        const selectedNodes = nodes
            .filter(
                (node) =>
                    node.id === searchedNodeId ||
                    node.style?.borderColor === eChartsColors.medium[0]
            )
            .map((node) => {
                node.style =
                    node.id === searchedNodeId && value
                        ? { ...NODE_STYLE, ...value }
                        : NODE_STYLE;

                return node;
            });

        const action = value ? 'set' : 'reset';

        set(
            produce((state: ScopedSystemGraphState) => {
                state.nodes = unionBy(selectedNodes, state.nodes, 'id');
            }),
            false,
            `node style ${action}`
        );
    },

    setSearchedNodeId: (value) => {
        const action = value ? 'set' : 'reset';

        set(
            produce((state: ScopedSystemGraphState) => {
                state.searchedNodeId = value;
            }),
            false,
            `searched node id ${action}`
        );
    },
});

export const useScopedSystemGraph = create<ScopedSystemGraphState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('scoped-system-graph')
    )
);
