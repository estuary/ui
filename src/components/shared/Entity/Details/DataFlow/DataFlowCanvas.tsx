import type {
    Edge,
    EdgeProps,
    Node,
    NodeChange,
    NodeProps,
} from '@xyflow/react';
import type { GraphLayout } from 'src/components/shared/Entity/Details/DataFlow/layout';
import type {
    DataFlowEdge,
    DataFlowGraph,
    DataFlowNode,
} from 'src/components/shared/Entity/Details/DataFlow/types';

import { useCallback, useEffect, useMemo } from 'react';

import { alpha, Box, Tooltip, Typography, useTheme } from '@mui/material';

import {
    Background,
    BackgroundVariant,
    Controls,
    Handle,
    MarkerType,
    MiniMap,
    Position,
    ReactFlow,
    useInternalNode,
    useNodesInitialized,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import { MoreHoriz } from 'iconoir-react';

import '@xyflow/react/dist/style.css';

import { getLineage } from 'src/components/shared/Entity/Details/DataFlow/graph';
import {
    KIND_LABELS,
    KindIcon,
} from 'src/components/shared/Entity/Details/DataFlow/KindIcon';
import {
    BACK_EDGE_LANE,
    layoutGraph,
    NODE_HEIGHT,
    NODE_WIDTH,
} from 'src/components/shared/Entity/Details/DataFlow/layout';
import { getStatusColor } from 'src/components/shared/Entity/Details/DataFlow/status';
import { getSurfaceColor } from 'src/components/shared/Entity/Details/DataFlow/surface';
import { formatShuffle } from 'src/components/shared/Entity/Details/DataFlow/transforms';
import { splitPathAndName } from 'src/utils/misc-utils';

// Space between parallel edges where they meet a node.
const PORT_SPREAD = 8;
const DIMMED_OPACITY = 0.18;
const HANDLE_SIZE = 8;
const GRID_SIZE = 16;
const MIN_HEIGHT = 360;
const MAX_HEIGHT = 640;
// Below this the minimap is more clutter than help.
const MINIMAP_MIN_NODES = 12;
const FIT_VIEW_OPTIONS = { padding: 0.12, maxZoom: 1 };
// React Flow asks that users who hide the attribution support the project:
// https://reactflow.dev/remove-attribution
const PRO_OPTIONS = { hideAttribution: true };

const describeEdge = (edge: DataFlowEdge) => {
    if (edge.kind === 'capture') {
        return ['Capture binding'];
    }

    if (edge.kind === 'materialization') {
        return ['Materialization binding'];
    }

    const { transform } = edge;
    if (!transform) {
        return ['Transform'];
    }

    return [
        `Transform ${transform.name}${transform.disabled ? ' (disabled)' : ''}`,
        `Shuffle: ${formatShuffle(transform.shuffle)}`,
        `Read delay: ${transform.readDelay ?? 'none'}`,
    ];
};

const ACCESS_CAPTIONS: Record<DataFlowNode['access'], string | null> = {
    ok: null,
    locked: 'No access',
    missing: 'Not found',
    unloaded: 'Not loaded',
};

type SpecNodeData = {
    node: DataFlowNode;
    isCentre: boolean;
    dimmed: boolean;
    hasIn: boolean;
    hasOut: boolean;
};

type SpecNodeType = Node<SpecNodeData, 'spec'>;

function SpecNode({ data, selected }: NodeProps<SpecNodeType>) {
    const theme = useTheme();
    const { node, isCentre, dimmed, hasIn, hasOut } = data;
    const [prefix, name] = splitPathAndName(node.id);
    const placeholder = node.access !== 'ok';
    const caption =
        ACCESS_CAPTIONS[node.access] ?? `${KIND_LABELS[node.kind]} · ${prefix}`;

    const handleStyle = (visible: boolean) => ({
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        minWidth: 0,
        minHeight: 0,
        border: `1.5px solid ${
            selected
                ? theme.palette.primary.main
                : alpha(theme.palette.text.primary, 0.28)
        }`,
        background: getSurfaceColor(theme),
        visibility: visible ? ('visible' as const) : ('hidden' as const),
    });

    return (
        <Box
            aria-label={node.id}
            sx={{
                'position': 'relative',
                'display': 'flex',
                'alignItems': 'center',
                'columnGap': 1.25,
                'width': NODE_WIDTH,
                'height': NODE_HEIGHT,
                'boxSizing': 'border-box',
                'px': 1.25,
                'borderRadius': 4,
                'bgcolor': getSurfaceColor(theme),
                'border': `1px ${placeholder ? 'dashed' : 'solid'} ${
                    selected || isCentre
                        ? theme.palette.primary.main
                        : theme.palette.divider
                }`,
                'boxShadow': selected
                    ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`
                    : 'none',
                'opacity': dimmed ? DIMMED_OPACITY : 1,
                'transition': 'opacity 150ms, box-shadow 150ms',
                'cursor': 'pointer',
                '&:hover': { borderColor: 'primary.main' },
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={false}
                style={handleStyle(hasIn)}
            />

            {isCentre ? (
                <Typography
                    sx={{
                        position: 'absolute',
                        top: -20,
                        left: 2,
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'primary.main',
                    }}
                >
                    This spec
                </Typography>
            ) : null}

            <Box
                sx={{
                    display: 'flex',
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 3,
                    color: placeholder ? 'text.disabled' : 'primary.main',
                    bgcolor: placeholder
                        ? 'action.hover'
                        : alpha(theme.palette.primary.main, 0.1),
                }}
            >
                <KindIcon node={node} size={17} color="inherit" />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    noWrap
                    component="div"
                    sx={{
                        fontSize: 11,
                        lineHeight: 1.4,
                        color: 'text.secondary',
                    }}
                >
                    {caption}
                </Typography>
                <Typography
                    noWrap
                    component="div"
                    title={node.id}
                    sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        color: placeholder ? 'text.secondary' : 'text.primary',
                        // Start-ellipsis keeps the distinguishing tail of
                        // long names visible.
                        direction: 'rtl',
                        textAlign: 'left',
                    }}
                >
                    <bdi>{name || node.id}</bdi>
                </Typography>
            </Box>

            {node.statusSummary ? (
                <Tooltip title={node.statusSummary}>
                    <Box
                        aria-label={node.statusSummary}
                        sx={{
                            flexShrink: 0,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor:
                                node.status === 'TASK_DISABLED'
                                    ? 'transparent'
                                    : getStatusColor(theme, node.status),
                            border: `1.5px solid ${getStatusColor(
                                theme,
                                node.status
                            )}`,
                        }}
                    />
                </Tooltip>
            ) : null}

            {node.hasMore ? (
                <Tooltip title="More specs beyond the depth limit">
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            ...(node.distance < 0
                                ? { left: -26 }
                                : { right: -26 }),
                            display: 'flex',
                            color: 'text.secondary',
                        }}
                    >
                        <MoreHoriz width={16} height={16} />
                    </Box>
                </Tooltip>
            ) : null}

            <Handle
                type="source"
                position={Position.Right}
                isConnectable={false}
                style={handleStyle(hasOut)}
            />
        </Box>
    );
}

type FlowEdgeData = {
    edge: DataFlowEdge;
    offset: number;
    route: 'forward' | 'back' | 'self';
    lane: number;
    // Waypoints only hold while both nodes stay where the layout put them;
    // once one is dragged the edge falls back to a direct curve.
    waypoints: { x: number; y: number }[];
    layoutFrom: { x: number; y: number };
    layoutTo: { x: number; y: number };
    highlighted: boolean;
    dimmed: boolean;
};

type FlowEdgeType = Edge<FlowEdgeData, 'flow'>;

const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const bend = Math.max(32, Math.abs(x2 - x1) / 2);
    return `C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
};

function FlowEdge({
    source,
    target,
    data,
    markerEnd,
}: EdgeProps<FlowEdgeType>) {
    const theme = useTheme();
    // Live positions, so edges follow dragged nodes.
    const from = useInternalNode(source)?.internals.positionAbsolute;
    const to = useInternalNode(target)?.internals.positionAbsolute;

    if (!data || !from || !to) {
        return null;
    }

    const { edge, offset, route, lane, highlighted, dimmed } = data;
    let path: string;

    if (route === 'self') {
        // Leaves the output handle, arcs over the top-right corner and
        // drops back into the top of the card.
        const x = from.x + NODE_WIDTH;
        const y = from.y + NODE_HEIGHT / 2;
        const entry = x - 36 - offset * 2;
        const reach = 36 + offset;

        path = `M ${x} ${y} C ${x + reach} ${y}, ${x + reach} ${
            from.y - reach
        }, ${(x + entry) / 2 + 8} ${from.y - reach} S ${entry} ${
            from.y - 18
        }, ${entry} ${from.y}`;
    } else if (route === 'back') {
        // Routed over the top of both nodes, one lane per back edge.
        const x1 = from.x + NODE_WIDTH / 2 + offset;
        const x2 = to.x + NODE_WIDTH / 2 + offset;
        const peak = Math.min(from.y, to.y) - 28 - lane * BACK_EDGE_LANE;
        // A cubic with both controls at c peaks at 0.25·y + 0.75·c.
        const c1 = (peak - 0.25 * from.y) / 0.75;
        const c2 = (peak - 0.25 * to.y) / 0.75;

        path = `M ${x1} ${from.y} C ${x1} ${c1}, ${x2} ${c2}, ${x2} ${to.y}`;
    } else {
        const unmoved =
            from.x === data.layoutFrom.x &&
            from.y === data.layoutFrom.y &&
            to.x === data.layoutTo.x &&
            to.y === data.layoutTo.y;

        let x = from.x + NODE_WIDTH;
        let y = from.y + NODE_HEIGHT / 2 + offset;
        const segments = [`M ${x} ${y}`];

        // Long edges pass through a lane in each layer they cross.
        (unmoved ? data.waypoints : []).forEach((point) => {
            segments.push(curve(x, y, point.x, point.y));
            segments.push(`L ${point.x + NODE_WIDTH} ${point.y}`);
            x = point.x + NODE_WIDTH;
            y = point.y;
        });

        segments.push(curve(x, y, to.x, to.y + NODE_HEIGHT / 2 + offset));
        path = segments.join(' ');
    }

    return (
        <Tooltip
            placement="top"
            title={
                <>
                    {describeEdge(edge).map((line) => (
                        <div key={line}>{line}</div>
                    ))}
                </>
            }
        >
            <g
                style={{
                    opacity: dimmed ? DIMMED_OPACITY : 1,
                    transition: 'opacity 150ms',
                }}
            >
                <path
                    d={path}
                    fill="none"
                    stroke={
                        highlighted
                            ? theme.palette.primary.main
                            : alpha(theme.palette.text.primary, 0.28)
                    }
                    strokeWidth={highlighted ? 2.5 : 1.5}
                    strokeLinecap="round"
                    strokeDasharray={edge.disabled ? '5 5' : undefined}
                    markerEnd={markerEnd}
                />
                {/* Wide invisible stroke so thin edges are easy to hover. */}
                <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={14}
                />
            </g>
        </Tooltip>
    );
}

const NODE_TYPES = { spec: SpecNode };
const EDGE_TYPES = { flow: FlowEdge };

const toFlowNodes = (
    graph: DataFlowGraph,
    layout: GraphLayout
): SpecNodeType[] => {
    const hasIn = new Set<string>();
    const hasOut = new Set<string>();

    graph.edges.forEach((edge) => {
        hasOut.add(edge.source);
        // Back edges and self-loops enter from the top, not the left handle.
        if (!layout.backEdges.has(edge.id) && !layout.selfLoops.has(edge.id)) {
            hasIn.add(edge.target);
        }
    });

    return graph.nodes.flatMap((node) => {
        const position = layout.positions.get(node.id);

        return position
            ? {
                  id: node.id,
                  type: 'spec' as const,
                  position: { x: position.x, y: position.y },
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                  data: {
                      node,
                      isCentre: node.id === graph.centre,
                      dimmed: false,
                      hasIn: hasIn.has(node.id),
                      hasOut: hasOut.has(node.id),
                  },
              }
            : [];
    });
};

// Refits once the nodes have been measured, and again when "show more"
// changes the graph, without remounting the canvas.
function FitOnChange({ layout }: { layout: GraphLayout }) {
    const { fitView } = useReactFlow();
    const initialized = useNodesInitialized();

    useEffect(() => {
        if (initialized) {
            void fitView(FIT_VIEW_OPTIONS);
        }
    }, [fitView, initialized, layout]);

    return null;
}

interface Props {
    graph: DataFlowGraph;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

export function DataFlowCanvas({ graph, selectedId, onSelect }: Props) {
    const theme = useTheme();

    const layout = useMemo(() => {
        // Upstream first, then by name, so layouts are stable across renders.
        const ordered = [...graph.nodes]
            .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
            .map(({ id }) => id);

        return layoutGraph(ordered, graph.edges);
    }, [graph]);

    // React Flow owns node positions so specs can be dragged. The layout
    // resets them whenever the graph itself changes.
    const [nodes, setNodes, onNodesChange] = useNodesState<SpecNodeType>(
        toFlowNodes(graph, layout)
    );
    useEffect(() => {
        setNodes(toFlowNodes(graph, layout));
    }, [graph, layout, setNodes]);

    const lineage = useMemo(
        () => (selectedId ? getLineage(selectedId, graph.edges) : null),
        [graph.edges, selectedId]
    );

    const displayNodes = useMemo(
        () =>
            nodes.map((node) => ({
                ...node,
                selected: node.id === selectedId,
                data: {
                    ...node.data,
                    dimmed: lineage ? !lineage.nodes.has(node.id) : false,
                },
            })),
        [lineage, nodes, selectedId]
    );

    const edges = useMemo((): FlowEdgeType[] => {
        const parallel = new Map<string, string[]>();
        graph.edges.forEach((edge) => {
            const pair = `${edge.source}->${edge.target}`;
            parallel.set(pair, [...(parallel.get(pair) ?? []), edge.id]);
        });

        return graph.edges.flatMap((edge) => {
            const layoutFrom = layout.positions.get(edge.source);
            const layoutTo = layout.positions.get(edge.target);

            if (!layoutFrom || !layoutTo) {
                return [];
            }

            const group = parallel.get(`${edge.source}->${edge.target}`) ?? [];
            const highlighted = Boolean(lineage?.edges.has(edge.id));
            const lane = layout.backEdges.get(edge.id);
            const route = layout.selfLoops.has(edge.id)
                ? ('self' as const)
                : lane !== undefined
                  ? ('back' as const)
                  : ('forward' as const);

            return {
                id: edge.id,
                type: 'flow' as const,
                source: edge.source,
                target: edge.target,
                selectable: false,
                focusable: false,
                // Back edges and self-loops run against the left-to-right
                // flow, so they carry an arrowhead.
                markerEnd:
                    route === 'forward'
                        ? undefined
                        : {
                              type: MarkerType.ArrowClosed,
                              width: 14,
                              height: 14,
                              color: highlighted
                                  ? theme.palette.primary.main
                                  : alpha(theme.palette.text.primary, 0.28),
                          },
                data: {
                    edge,
                    offset:
                        (group.indexOf(edge.id) - (group.length - 1) / 2) *
                        PORT_SPREAD,
                    route,
                    lane: lane ?? 0,
                    waypoints: layout.waypoints.get(edge.id) ?? [],
                    layoutFrom: { x: layoutFrom.x, y: layoutFrom.y },
                    layoutTo: { x: layoutTo.x, y: layoutTo.y },
                    highlighted,
                    dimmed: Boolean(lineage) && !highlighted,
                },
            };
        });
    }, [graph.edges, layout, lineage, theme]);

    // Selection lives in the parent, so it can drive the lineage and the
    // side panel. Clicks, keyboard selection (Enter on a focused node) and
    // pane clicks all arrive here as select changes.
    const handleNodesChange = useCallback(
        (changes: NodeChange<SpecNodeType>[]) => {
            onNodesChange(changes.filter((change) => change.type !== 'select'));

            const picked = changes.find(
                (change) => change.type === 'select' && change.selected
            );

            if (picked && picked.type === 'select') {
                onSelect(picked.id);
            } else if (
                changes.some(
                    (change) =>
                        change.type === 'select' && change.id === selectedId
                )
            ) {
                onSelect(null);
            }
        },
        [onNodesChange, onSelect, selectedId]
    );

    const height = Math.min(
        MAX_HEIGHT,
        Math.max(MIN_HEIGHT, layout.height + 48)
    );

    return (
        <Box
            component="section"
            aria-label={`Data flow for ${graph.centre}`}
            sx={{
                'height': height,
                'borderRadius': 6,
                'overflow': 'hidden',
                'border': `1px solid ${theme.palette.divider}`,
                '& .react-flow': {
                    '--xy-background-color': theme.palette.background.default,
                    '--xy-controls-button-background-color':
                        getSurfaceColor(theme),
                    '--xy-controls-button-background-color-hover':
                        theme.palette.action.hover,
                    '--xy-controls-button-color': theme.palette.text.primary,
                    '--xy-controls-button-color-hover':
                        theme.palette.text.primary,
                    '--xy-controls-button-border-color': theme.palette.divider,
                    '--xy-minimap-background-color': getSurfaceColor(theme),
                },
                // The card draws its own border, selection and focus ring.
                '& .react-flow__node-spec': {
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    boxShadow: 'none',
                },
                '& .react-flow__node-spec:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 3,
                    borderRadius: 4,
                },
            }}
        >
            <ReactFlow
                nodes={displayNodes}
                edges={edges}
                nodeTypes={NODE_TYPES}
                edgeTypes={EDGE_TYPES}
                onNodesChange={handleNodesChange}
                selectNodesOnDrag={false}
                colorMode={theme.palette.mode}
                proOptions={PRO_OPTIONS}
                minZoom={0.2}
                maxZoom={1.75}
                nodesConnectable={false}
                edgesFocusable={false}
                // Read-only view: no delete, box select or multi-select.
                deleteKeyCode={null}
                selectionKeyCode={null}
                multiSelectionKeyCode={null}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={GRID_SIZE}
                    size={1}
                    color={alpha(theme.palette.text.primary, 0.18)}
                />
                <Controls
                    showInteractive={false}
                    fitViewOptions={FIT_VIEW_OPTIONS}
                />
                {graph.nodes.length >= MINIMAP_MIN_NODES ? (
                    <MiniMap
                        pannable
                        zoomable
                        nodeColor={alpha(theme.palette.primary.main, 0.35)}
                        maskColor={alpha(theme.palette.background.default, 0.7)}
                    />
                ) : null}
                <FitOnChange layout={layout} />
            </ReactFlow>
        </Box>
    );
}
