import { Stack, useTheme } from '@mui/material';
import { EntityNode } from 'api/liveSpecFlows';
import { authenticatedRoutes } from 'app/routes';
import NodeSearch from 'components/shared/Entity/Details/Overview/Connections/Toolbar/Search';
import ZoomSettings from 'components/shared/Entity/Details/Overview/Connections/Toolbar/Zoom';
import NodeTooltip from 'components/shared/Entity/Details/Overview/Connections/tooltips/NodeTooltip';
import {
    defaultOutline,
    defaultOutlineColor,
    eChartsColors,
} from 'context/Theme';
import cytoscape, { Core, EdgeDefinition, NodeDefinition } from 'cytoscape';
import cytoscapePopper, { PopperFactory } from 'cytoscape-popper';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Entity } from 'types';
import { getPathWithParams } from 'utils/misc-utils';
import useNodeSearch from './useNodeSearch';
import useTooltip from './useTooltip';
import useZoomFreeform from './useZoomFreeform';
import useZoomManual from './useZoomManual';

interface Props {
    childNodes: EntityNode[];
    currentNode: EntityNode;
    containerId: string;
    parentNodes: EntityNode[];
}

export type Relationship = 'parent' | 'self' | 'child';

interface GridPosition {
    row: number;
    col: number;
}

export interface NodeData {
    gridPosition: GridPosition;
    id: string;
    name: string;
    relationship: Relationship;
    type: Entity;
}

export interface Node extends NodeDefinition {
    data: NodeData;
}

interface Edge extends EdgeDefinition {
    data: { id: string; source: string; target: string };
}

const getDetailsPageURLPath = (entityType: string): string => {
    if (entityType === 'collection') {
        return authenticatedRoutes.collections.details.overview.fullPath;
    }

    if (entityType === 'capture') {
        return authenticatedRoutes.captures.details.overview.fullPath;
    }

    return authenticatedRoutes.materializations.details.overview.fullPath;
};

const getRowIndex = (
    count: number,
    previousIndex: number,
    selfIndex: number,
    maxRelationsEven: boolean
): number => {
    const compositeIndex =
        maxRelationsEven && previousIndex >= selfIndex
            ? previousIndex + 1
            : previousIndex;

    return count === 1 ? selfIndex : compositeIndex;
};

const getElements = (
    nodes: EntityNode[],
    count: number,
    selfId: string,
    selfIndex: number,
    maxRelationsEven: boolean,
    isParent?: boolean
): [Node[], Edge[]] => {
    const nodeEls: Node[] = [];
    const edgeEls: Edge[] = [];

    const relationship: Relationship = isParent ? 'parent' : 'child';

    nodes.forEach(({ catalog_name, id, spec_type }, index) => {
        const row = getRowIndex(count, index, selfIndex, maxRelationsEven);

        nodeEls.push({
            data: {
                gridPosition: { row, col: isParent ? 1 : 3 },
                id,
                name: catalog_name,
                relationship,
                type: spec_type as Entity,
            },
        });

        edgeEls.push({
            data: {
                id: `${id} to ${selfId}`,
                source: isParent ? id : selfId,
                target: isParent ? selfId : id,
            },
        });
    });

    return [nodeEls, edgeEls];
};

const onClick = (event: cytoscape.EventObject) => {
    const { cy, target } = event;

    // The shorthand for the id property cannot be used as a selector here.
    const node = cy.$id(target.id());

    console.log('single click', node.data('name'));
};

const popperFactory: PopperFactory = (_ref, _content, _options) =>
    document.createElement('div');

cytoscape.use(cytoscapePopper(popperFactory));

function ScopedSystemGraph({
    childNodes,
    currentNode,
    containerId,
    parentNodes,
}: Props) {
    const theme = useTheme();
    const navigate = useNavigate();

    const [cyCore, setCyCore] = useState<Core | null>(null);

    const [nodes, edges, rowCount] = useMemo(() => {
        const childCount = childNodes.length;
        const parentCount = parentNodes.length;

        const maxRelationsOfType =
            childCount > parentCount ? childCount : parentCount;

        const maxRelationsEven = maxRelationsOfType % 2 === 0;

        const numberOfRows = maxRelationsEven
            ? maxRelationsOfType + 1
            : maxRelationsOfType;

        const selfIndex = Math.ceil((numberOfRows - 1) / 2);

        const selfNodeEl: Node[] = [
            {
                data: {
                    gridPosition: { row: selfIndex, col: 2 },
                    id: currentNode.id,
                    name: currentNode.catalog_name,
                    relationship: 'self',
                    type: currentNode.spec_type as Entity,
                },
            },
        ];

        const [parentNodeEls, parentEdgeEls] = getElements(
            parentNodes,
            parentCount,
            currentNode.id,
            selfIndex,
            maxRelationsEven,
            true
        );

        const [childNodeEls, childEdgeEls] = getElements(
            childNodes,
            childCount,
            currentNode.id,
            selfIndex,
            maxRelationsEven
        );

        const nodeEls: Node[] = selfNodeEl.concat(parentNodeEls, childNodeEls);
        const edgeEls: Edge[] = parentEdgeEls.concat(childEdgeEls);

        return [nodeEls, edgeEls, numberOfRows];
    }, [childNodes, currentNode, parentNodes]);

    const { onSelectOption, searchOptions } = useNodeSearch(cyCore, nodes);
    const { anchorEl } = useTooltip(cyCore);
    const { onFreeformZoom } = useZoomFreeform(cyCore);
    const { onManualZoom } = useZoomManual(cyCore);

    useEffect(() => {
        console.log('nodes', nodes);
        console.log('edges', edges);

        const core = cytoscape({
            // The container in which the data visualization will be rendered.
            container: document.getElementById(containerId),

            // The set of initial graph elements.
            elements: {
                nodes,
                edges,
            },

            minZoom: 0.5,
            maxZoom: 5,

            // The stylesheet for the graph.
            style: [
                {
                    selector: 'edge',
                    style: {
                        'line-color': defaultOutlineColor[theme.palette.mode],
                        'target-arrow-shape': 'none',
                        'width': 2,
                    },
                },
                {
                    selector: 'node',
                    style: {
                        'color': theme.palette.text.primary,
                        'height': 21,
                        'label': 'data(name)',
                        'font-size': 14,
                        'width': 21,
                    },
                },
                {
                    selector: 'node[relationship = "self"]',
                    style: {
                        'text-background-color':
                            theme.palette.mode === 'light'
                                ? '#EFEFEF'
                                : '#5A5A5A',
                        'text-background-opacity': 1,
                        'text-background-padding': '4px',
                        'text-background-shape': 'roundrectangle',
                        'text-margin-y': -8,
                    },
                },
                {
                    selector: 'node[relationship = "parent"]',
                    style: {
                        'background-color': eChartsColors.medium[0],
                        'text-halign': 'left',
                        'text-margin-x': -8,
                        'text-valign': 'center',
                    },
                },
                {
                    selector: 'node[relationship = "child"]',
                    style: {
                        'background-color': eChartsColors.medium[1],
                        'text-halign': 'right',
                        'text-margin-x': 8,
                        'text-valign': 'center',
                    },
                },
                {
                    selector: '.highlight',
                    style: {
                        'background-color': eChartsColors.light[1],
                    },
                },
            ],

            // Placeholder
            layout: {
                cols: 3,
                condense: true,
                fit: false,
                name: 'grid',
                nodeDimensionsIncludeLabels: true,
                position: (node) => {
                    const gridPosition: GridPosition =
                        node.data('gridPosition');

                    return gridPosition;
                },
                rows: rowCount,
            },

            // Whether user events (e.g. mouse wheel, pinch-to-zoom) are allowed to zoom the graph.
            userZoomingEnabled: false,
        });

        const centerNode = core.$id(currentNode.id);
        core.center(centerNode);

        setCyCore(core);
    }, [
        containerId,
        currentNode.id,
        edges,
        nodes,
        rowCount,
        theme.palette.background.paper,
        theme.palette.mode,
        theme.palette.text.primary,
    ]);

    // TODO (scoped system graph): Remove double click interaction as per request.
    const onDoubleClick = useCallback(
        (event: cytoscape.EventObject) => {
            const { cy, target } = event;

            // The shorthand for the id property cannot be used as a selector here.
            const node = cy.$id(target.id());

            if (node.data('relationship') !== 'self') {
                console.log('double click', node.data('name'));

                const basePath = getDetailsPageURLPath(node.data('type'));

                const route = getPathWithParams(basePath, {
                    [GlobalSearchParams.CATALOG_NAME]: node.data('name'),
                });

                navigate(route);
            }
        },
        [navigate]
    );

    useEffect(() => {
        cyCore?.on('oneclick', 'node', (event) => onClick(event));

        cyCore?.on('dblclick', 'node', (event) => onDoubleClick(event));
    }, [cyCore, onDoubleClick]);

    return (
        <>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    px: 1,
                    py: 1,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    border: defaultOutline[theme.palette.mode],
                    borderBottom: 'none',
                }}
            >
                <NodeSearch
                    onSelectOption={onSelectOption}
                    options={searchOptions}
                />

                <ZoomSettings
                    onFreeformZoom={onFreeformZoom}
                    onManualZoom={onManualZoom}
                />
            </Stack>

            <div
                id={containerId}
                style={{
                    width: 'inherit',
                    height: 350,
                    border: defaultOutline[theme.palette.mode],
                }}
            />

            <NodeTooltip anchorEl={anchorEl} />
        </>
    );
}

export default ScopedSystemGraph;
