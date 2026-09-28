import type { DataFlowNode } from 'src/components/shared/Entity/Details/DataFlow/types';

import {
    alpha,
    Box,
    Button,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { NavArrowRight, Xmark } from 'iconoir-react';
import { Link } from 'react-router-dom';

import { useDataFlowSpecDetails } from 'src/api/gql/dataFlow';
import {
    KIND_LABELS,
    KindIcon,
} from 'src/components/shared/Entity/Details/DataFlow/KindIcon';
import { getDataFlowPath } from 'src/components/shared/Entity/Details/DataFlow/links';
import {
    ConnectionsTable,
    SectionHeading,
    TransformsTable,
} from 'src/components/shared/Entity/Details/DataFlow/RelatedTable';
import { SpecProperties } from 'src/components/shared/Entity/Details/DataFlow/SpecProperties';
import { getStatusColor } from 'src/components/shared/Entity/Details/DataFlow/status';

const ACCESS_NOTES: Record<DataFlowNode['access'], string | null> = {
    ok: null,
    locked: 'You do not have access to this spec, so only its name is shown.',
    missing: 'This spec is referenced but no longer exists.',
    unloaded:
        'Only a disabled transform reads from this collection, so its details were not loaded.',
};

function StatusPill({ node }: { node: DataFlowNode }) {
    const theme = useTheme();
    const color = getStatusColor(theme, node.status);

    return node.statusSummary ? (
        <Stack
            direction="row"
            spacing={0.75}
            sx={{
                alignItems: 'center',
                flexShrink: 0,
                px: 1,
                py: 0.25,
                borderRadius: 4,
                bgcolor: alpha(color, 0.12),
            }}
        >
            <Box
                sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: color,
                }}
            />
            <Typography
                variant="caption"
                sx={{ color: 'text.primary', fontWeight: 500 }}
            >
                {node.statusSummary}
            </Typography>
        </Stack>
    ) : null;
}

interface Props {
    node: DataFlowNode;
    isCentre: boolean;
    // Every spec in the graph, for access and kind of related specs.
    graphNodes: Map<string, DataFlowNode>;
    onClose: () => void;
}

export function DataFlowPanel({ node, isCentre, graphNodes, onClose }: Props) {
    const theme = useTheme();
    const note = ACCESS_NOTES[node.access];
    const { details, loading, error } = useDataFlowSpecDetails(
        node.access === 'ok' ? node.id : null
    );

    // Sources outside the graph (e.g. a downstream derivation's other
    // inputs) are only readable if their ref says so.
    const canRead = (name: string) =>
        graphNodes.get(name)?.access === 'ok' ||
        Boolean(
            details?.liveSpec?.readsFrom?.edges.some(
                (edge) =>
                    edge.node.catalogName === name && edge.node.userCapability
            )
        );

    return (
        <Stack sx={{ height: '100%', minWidth: 0 }}>
            <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', px: 2, py: 1.5 }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexShrink: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 3,
                        color:
                            node.access === 'ok'
                                ? 'primary.main'
                                : 'text.disabled',
                        bgcolor:
                            node.access === 'ok'
                                ? alpha(theme.palette.primary.main, 0.1)
                                : 'action.hover',
                    }}
                >
                    <KindIcon node={node} size={17} color="inherit" />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        component="div"
                        sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: 'text.secondary',
                            lineHeight: 1.4,
                        }}
                    >
                        {KIND_LABELS[node.kind]}
                    </Typography>
                    <Typography
                        noWrap
                        title={node.id}
                        sx={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}
                    >
                        {node.id}
                    </Typography>
                </Box>

                <StatusPill node={node} />

                <Box sx={{ flex: 1 }} />

                {/* Lands on the spec's own Data flow tab; its other tabs are
                    one click away there. */}
                {node.access === 'ok' && !isCentre ? (
                    <Tooltip title={`Show the data flow for ${node.id}`}>
                        <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            to={getDataFlowPath(node.kind, node.id)}
                            aria-label={`Show the data flow for ${node.id}`}
                            endIcon={<NavArrowRight width={16} height={16} />}
                            sx={{ flexShrink: 0 }}
                        >
                            Go
                        </Button>
                    </Tooltip>
                ) : null}
                <IconButton size="small" onClick={onClose} aria-label="Close">
                    <Xmark width={16} height={16} />
                </IconButton>
            </Stack>

            <Divider />

            {note ? (
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', px: 2, py: 2 }}
                >
                    {note}
                </Typography>
            ) : error ? (
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', px: 2, py: 2 }}
                >
                    These details could not be loaded.
                </Typography>
            ) : (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'minmax(0, 1fr)',
                            lg: 'minmax(240px, 300px) minmax(0, 1fr)',
                        },
                        columnGap: 4,
                        rowGap: 2,
                        px: 2,
                        py: 1.5,
                        alignContent: 'start',
                        // Scrolls inside the fixed-height slot if it
                        // overflows, e.g. when the columns stack.
                        overflowY: 'auto',
                    }}
                >
                    <Box>
                        <SectionHeading title="Details" />
                        <SpecProperties
                            node={node}
                            details={details}
                            loading={loading}
                        />
                    </Box>

                    <Box>
                        {node.transforms ? (
                            <TransformsTable
                                node={node}
                                transforms={node.transforms}
                                canRead={canRead}
                            />
                        ) : details ? (
                            <ConnectionsTable
                                node={node}
                                details={details}
                                graphNodes={graphNodes}
                            />
                        ) : null}
                    </Box>
                </Box>
            )}
        </Stack>
    );
}
