import { Stack, useTheme } from '@mui/material';
import { EntityNode } from 'api/liveSpecFlows';
import { authenticatedRoutes } from 'app/routes';
import { useScopedSystemGraph } from 'components/shared/Entity/Details/Overview/Connections/Store/Store';
import ZoomSettings from 'components/shared/Entity/Details/Overview/Connections/Toolbar/Zoom';
import {
    defaultOutline,
    defaultOutlineColor,
    eChartsColors,
} from 'context/Theme';
import cytoscape, { Core, EdgeDefinition, NodeDefinition } from 'cytoscape';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import {
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Entity } from 'types';
import { getPathWithParams } from 'utils/misc-utils';

interface Props {
    childNodes: EntityNode[];
    currentNode: EntityNode;
    containerId: string;
    parentNodes: EntityNode[];
}

type Relationship = 'parent' | 'self' | 'child';

interface GridPosition {
    row: number;
    col: number;
}

interface Node extends NodeDefinition {
    data: {
        gridPosition: GridPosition;
        id: string;
        name: string;
        relationship: Relationship;
        type: Entity;
    };
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

const onClick = (event: cytoscape.EventObject) => {
    const { cy, target } = event;

    // The shorthand for the id property cannot be used as a selector here.
    const node = cy.$id(target.id());

    console.log('single click', node.data('name'));
};

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

        const nodeEls: Node[] = [
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

        const edgeEls: Edge[] = [];

        parentNodes.forEach(({ catalog_name, id, spec_type }, index) => {
            const row = getRowIndex(
                parentCount,
                index,
                selfIndex,
                maxRelationsEven
            );

            nodeEls.push({
                data: {
                    gridPosition: { row, col: 1 },
                    id,
                    name: catalog_name,
                    relationship: 'parent',
                    type: spec_type as Entity,
                },
            });

            edgeEls.push({
                data: {
                    id: `${id} to ${currentNode.id}`,
                    source: id,
                    target: currentNode.id,
                },
            });
        });

        childNodes.forEach(({ catalog_name, id, spec_type }, index) => {
            const row = getRowIndex(
                childCount,
                index,
                selfIndex,
                maxRelationsEven
            );

            nodeEls.push({
                data: {
                    gridPosition: { row, col: 3 },
                    id,
                    name: catalog_name,
                    relationship: 'child',
                    type: spec_type as Entity,
                },
            });

            edgeEls.push({
                data: {
                    id: `${id} to ${currentNode.id}`,
                    source: currentNode.id,
                    target: id,
                },
            });
        });

        return [nodeEls, edgeEls, numberOfRows];
    }, [childNodes, currentNode, parentNodes]);

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

        // const centerRow = centerNode.data('gridPosition.row');
        // const lowerBound = centerRow > 0 ? centerRow - 1 : 0;

        // const focalNodes = core.nodes(
        //     `[gridPosition.row >= ${lowerBound}][gridPosition.row !> ${centerRow}],[gridPosition.row !< ${centerRow}][gridPosition.row <= ${
        //         centerRow + 1
        //     }]`
        // );
        // core.fit(focalNodes);

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

    const setUserZoomingEnabled = useScopedSystemGraph(
        (state) => state.setUserZoomingEnabled
    );

    const onFreeformZoomChange = useCallback(
        (event: SyntheticEvent<Element, Event>, checked: boolean) => {
            event.preventDefault();
            event.stopPropagation();

            setUserZoomingEnabled(cyCore, checked);
        },
        [cyCore, setUserZoomingEnabled]
    );

    const setZoom = useScopedSystemGraph((state) => state.setZoom);

    const onManualZoom = useCallback(
        (event: SyntheticEvent<Element, Event>, value: number) => {
            event.preventDefault();
            event.stopPropagation();

            setZoom(cyCore, value);
        },
        [cyCore, setZoom]
    );

    useEffect(() => {
        cyCore?.on('scrollzoom', () => {
            setZoom(cyCore);
        });
    }, [cyCore, setZoom]);

    return (
        <>
            <Stack
                direction="row"
                sx={{
                    px: 1,
                    justifyContent: 'flex-end',
                    border: defaultOutline[theme.palette.mode],
                    borderBottom: 'none',
                }}
            >
                <ZoomSettings
                    onFreeformZoomChange={onFreeformZoomChange}
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
        </>
    );
}

export default ScopedSystemGraph;
