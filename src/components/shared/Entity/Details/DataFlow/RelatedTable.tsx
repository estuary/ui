import type { SpecDetailsNode } from 'src/api/gql/dataFlow';
import type {
    DataFlowNode,
    DataFlowNodeKind,
    TransformInfo,
} from 'src/components/shared/Entity/Details/DataFlow/types';

import {
    Box,
    Chip,
    Link as MuiLink,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import {
    KIND_LABELS,
    KindIcon,
} from 'src/components/shared/Entity/Details/DataFlow/KindIcon';
import { getDataFlowPath } from 'src/components/shared/Entity/Details/DataFlow/links';
import { formatShuffle } from 'src/components/shared/Entity/Details/DataFlow/transforms';

const TABLE_SX = {
    '& th, & td': {
        px: 1.5,
        py: 0.75,
        borderColor: 'divider',
        fontSize: 13,
        whiteSpace: 'nowrap',
    },
    '& th': {
        color: 'text.secondary',
        fontWeight: 500,
        bgcolor: 'transparent',
    },
    '& th:first-of-type, & td:first-of-type': { pl: 0 },
    '& tbody tr:last-of-type td': { borderBottom: 'none' },
} as const;

function SpecLink({
    name,
    kind,
    readable,
}: {
    name: string;
    kind: DataFlowNodeKind;
    readable: boolean;
}) {
    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <KindIcon
                node={{ kind, access: readable ? 'ok' : 'locked' }}
                size={14}
            />
            {readable ? (
                <MuiLink component={Link} to={getDataFlowPath(kind, name)}>
                    {name}
                </MuiLink>
            ) : (
                <Typography
                    variant="body2"
                    component="span"
                    sx={{ color: 'text.secondary' }}
                >
                    {name}
                </Typography>
            )}
        </Stack>
    );
}

export function SectionHeading({
    title,
    count,
}: {
    title: string;
    count?: number;
}) {
    return (
        <Typography
            component="h3"
            sx={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 1,
            }}
        >
            {title}
            {count === undefined ? null : (
                <Box component="span" sx={{ ml: 0.75, fontWeight: 500 }}>
                    {count}
                </Box>
            )}
        </Typography>
    );
}

const shortDate = (ts: string) => format(new Date(ts), 'PP');

const filtersOf = (transform: TransformInfo) =>
    [
        transform.notBefore ? `after ${shortDate(transform.notBefore)}` : null,
        transform.notAfter ? `before ${shortDate(transform.notAfter)}` : null,
        transform.hasPartitionSelector ? 'partition selector' : null,
    ]
        .filter(Boolean)
        .join(', ');

const filtersTitle = (transform: TransformInfo) =>
    [
        transform.notBefore ? `Not before ${transform.notBefore}` : null,
        transform.notAfter ? `Not after ${transform.notAfter}` : null,
    ]
        .filter(Boolean)
        .join('\n');

interface TransformsProps {
    node: DataFlowNode;
    transforms: TransformInfo[];
    canRead: (name: string) => boolean;
}

export function TransformsTable({
    node,
    transforms,
    canRead,
}: TransformsProps) {
    // Only spend columns on settings some transform actually uses.
    const showFilters = transforms.some((transform) => filtersOf(transform));
    const showReadDelay = transforms.some(({ readDelay }) => readDelay);
    const showPriority = transforms.some(({ priority }) => priority);

    return (
        <>
            <SectionHeading title="Transforms" count={transforms.length} />
            <Table size="small" sx={TABLE_SX}>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Shuffle</TableCell>
                        {showReadDelay ? (
                            <TableCell>Read delay</TableCell>
                        ) : null}
                        {showPriority ? <TableCell>Priority</TableCell> : null}
                        {showFilters ? <TableCell>Filters</TableCell> : null}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transforms.map((transform) => (
                        <TableRow
                            key={transform.name}
                            sx={{ opacity: transform.disabled ? 0.6 : 1 }}
                        >
                            <TableCell>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ alignItems: 'center' }}
                                >
                                    <span>{transform.name}</span>
                                    {transform.disabled ? (
                                        <Chip size="small" label="Disabled" />
                                    ) : null}
                                </Stack>
                            </TableCell>
                            <TableCell>
                                {transform.source === node.id ? (
                                    <Typography
                                        variant="body2"
                                        component="span"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        Itself
                                    </Typography>
                                ) : (
                                    <SpecLink
                                        name={transform.source}
                                        kind="collection"
                                        readable={canRead(transform.source)}
                                    />
                                )}
                            </TableCell>
                            <TableCell>
                                {formatShuffle(transform.shuffle)}
                            </TableCell>
                            {showReadDelay ? (
                                <TableCell>
                                    {transform.readDelay ?? '—'}
                                </TableCell>
                            ) : null}
                            {showPriority ? (
                                <TableCell>{transform.priority ?? 0}</TableCell>
                            ) : null}
                            {showFilters ? (
                                <TableCell
                                    title={filtersTitle(transform) || undefined}
                                    // The one column allowed to wrap, so the
                                    // table fits the panel.
                                    sx={{
                                        whiteSpace: 'normal !important',
                                        minWidth: 132,
                                    }}
                                >
                                    {filtersOf(transform) || '—'}
                                </TableCell>
                            ) : null}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}

interface Connection {
    name: string;
    kind: DataFlowNodeKind;
    readable: boolean;
    relation: string;
}

const readerKind = (catalogType: string | undefined): DataFlowNodeKind =>
    catalogType === 'materialization'
        ? 'materialization'
        : // Collections that read another collection are derivations.
          'derivation';

const getConnections = (
    node: DataFlowNode,
    details: SpecDetailsNode,
    graphNodes: Map<string, DataFlowNode>
): { title: string; rows: Connection[] } => {
    const liveSpec = details.liveSpec;
    // The API can't tell a derivation from a collection without its model;
    // the graph often already knows.
    const collectionKind = (name: string): DataFlowNodeKind =>
        graphNodes.get(name)?.kind ?? 'collection';

    switch (node.kind) {
        case 'capture':
            return {
                title: 'Writes to',
                rows:
                    liveSpec?.writesTo?.edges.map(({ node: ref }) => ({
                        name: ref.catalogName,
                        kind: collectionKind(ref.catalogName),
                        readable: Boolean(ref.userCapability),
                        relation: 'Binding',
                    })) ?? [],
            };
        case 'materialization':
            return {
                title: 'Reads from',
                rows:
                    liveSpec?.readsFrom?.edges.map(({ node: ref }) => ({
                        name: ref.catalogName,
                        kind: collectionKind(ref.catalogName),
                        readable: Boolean(ref.userCapability),
                        relation: 'Binding',
                    })) ?? [],
            };
        default:
            // Readers and writers the viewer can't see are omitted by the
            // API, so every row here is readable.
            return {
                title: 'Connected specs',
                rows: [
                    ...(liveSpec?.writtenBy?.edges.map(({ node: ref }) => ({
                        name: ref.catalogName,
                        kind: 'capture' as const,
                        readable: true,
                        relation: 'Writes to it',
                    })) ?? []),
                    ...(liveSpec?.readBy?.edges.map(({ node: ref }) => ({
                        name: ref.catalogName,
                        kind: readerKind(ref.liveSpec?.catalogType),
                        readable: true,
                        relation: 'Reads from it',
                    })) ?? []),
                ],
            };
    }
};

export function ConnectionsTable({
    node,
    details,
    graphNodes,
}: {
    node: DataFlowNode;
    details: SpecDetailsNode;
    graphNodes: Map<string, DataFlowNode>;
}) {
    const { title, rows } = getConnections(node, details, graphNodes);
    const showRelation = new Set(rows.map(({ relation }) => relation)).size > 1;

    return (
        <>
            <SectionHeading title={title} count={rows.length} />
            {rows.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    None.
                </Typography>
            ) : (
                <Table size="small" sx={TABLE_SX}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            {showRelation ? (
                                <TableCell>Relationship</TableCell>
                            ) : null}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={`${row.relation}:${row.name}`}>
                                <TableCell>
                                    <SpecLink
                                        name={row.name}
                                        kind={row.kind}
                                        readable={row.readable}
                                    />
                                </TableCell>
                                <TableCell>{KIND_LABELS[row.kind]}</TableCell>
                                {showRelation ? (
                                    <TableCell>{row.relation}</TableCell>
                                ) : null}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
