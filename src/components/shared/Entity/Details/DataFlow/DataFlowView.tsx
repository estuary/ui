import type { DataFlowGraph } from 'src/components/shared/Entity/Details/DataFlow/types';

import { useMemo, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    LinearProgress,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { DataFlowCanvas } from 'src/components/shared/Entity/Details/DataFlow/DataFlowCanvas';
import { DataFlowPanel } from 'src/components/shared/Entity/Details/DataFlow/DataFlowPanel';
import {
    KIND_LABELS,
    KindIcon,
} from 'src/components/shared/Entity/Details/DataFlow/KindIcon';
import { getSurfaceColor } from 'src/components/shared/Entity/Details/DataFlow/surface';

// Fits a derivation with a couple of transforms without scrolling.
const PANEL_HEIGHT = 330;

function Legend() {
    const theme = useTheme();

    return (
        <Stack
            direction="row"
            sx={{
                flexWrap: 'wrap',
                columnGap: 2,
                rowGap: 0.5,
                color: 'text.secondary',
            }}
        >
            {(
                [
                    'capture',
                    'collection',
                    'derivation',
                    'materialization',
                ] as const
            ).map((kind) => (
                <Stack
                    key={kind}
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'center' }}
                >
                    <KindIcon node={{ kind, access: 'ok' }} size={14} />
                    <Typography variant="caption">
                        {KIND_LABELS[kind]}
                    </Typography>
                </Stack>
            ))}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <KindIcon
                    node={{ kind: 'collection', access: 'locked' }}
                    size={14}
                />
                <Typography variant="caption">No access</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <svg width={24} height={8} aria-hidden>
                    <line
                        x1={0}
                        y1={4}
                        x2={24}
                        y2={4}
                        stroke={theme.palette.text.disabled}
                        strokeWidth={1.5}
                        strokeDasharray="5 4"
                    />
                </svg>
                <Typography variant="caption">Disabled transform</Typography>
            </Stack>
        </Stack>
    );
}

interface Props {
    graph: DataFlowGraph;
    depth: number;
    loading?: boolean;
    onShowMore?: () => void;
}

export function DataFlowView({ graph, depth, loading, onShowMore }: Props) {
    const theme = useTheme();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const graphNodes = useMemo(
        () => new Map(graph.nodes.map((node) => [node.id, node])),
        [graph.nodes]
    );

    // Drop a selection that no longer exists after the graph changes.
    const selected = graph.nodes.find((node) => node.id === selectedId) ?? null;

    return (
        <Stack spacing={2}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                }}
            >
                <Stack spacing={0.5}>
                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                    >
                        {`Everything upstream and downstream of this spec, up to ${depth} hops away. Select a spec to trace its lineage; drag to pan and scroll to zoom.`}
                    </Typography>
                    <Legend />
                </Stack>

                {graph.truncated && onShowMore ? (
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={loading}
                        onClick={onShowMore}
                        sx={{ flexShrink: 0 }}
                    >
                        Show more
                    </Button>
                ) : null}
            </Stack>

            {graph.partial ? (
                <Alert severity="warning">
                    Some specs have too many connections to show them all. The
                    graph may be missing some of them.
                </Alert>
            ) : null}

            <Box sx={{ height: 4 }}>{loading ? <LinearProgress /> : null}</Box>

            <DataFlowCanvas
                graph={graph}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
            />

            {/* Below the canvas so the graph keeps its full width. The slot
                is always present and a fixed height, so selecting specs never
                shifts the page; longer details scroll inside it. */}
            <Box
                sx={{
                    height: PANEL_HEIGHT,
                    overflow: 'hidden',
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: getSurfaceColor(theme),
                }}
            >
                {selected ? (
                    <DataFlowPanel
                        node={selected}
                        isCentre={selected.id === graph.centre}
                        graphNodes={graphNodes}
                        onClose={() => setSelectedId(null)}
                    />
                ) : (
                    <Stack
                        sx={{
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                        >
                            Select a spec in the graph to see its details here.
                        </Typography>
                    </Stack>
                )}
            </Box>
        </Stack>
    );
}
