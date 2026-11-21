import type { BucketLayout } from 'src/components/admin/Billing/usage/period';
import type {
    SortKey,
    TaskUsageRow,
} from 'src/components/admin/Billing/usage/rows';
import type { TaskKind } from 'src/hooks/billing/useTaskUsageTasks';

import {
    ButtonBase,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    tableSortLabelClasses,
    Typography,
} from '@mui/material';

import { ArrowDown } from 'iconoir-react';

import {
    captionSx,
    numericSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import {
    formatCents,
    formatGb,
    formatNumber,
} from 'src/components/admin/Billing/shared/format';
import { Swatch } from 'src/components/admin/Billing/shared/Swatch';
import { useUsageColors } from 'src/components/admin/Billing/shared/useUsageColors';
import { formatBucketShort } from 'src/components/admin/Billing/usage/period';
import { toGb, toHours } from 'src/components/admin/Billing/usage/rows';
import { Sparkline } from 'src/components/admin/Billing/usage/Sparkline';

const KIND_LABELS: Record<TaskKind, string> = {
    capture: 'Capture',
    materialization: 'Materialization',
    derivation: 'Derivation',
};

const SKELETON_ROWS = 5;

// The arrow after the text, as in "Data ↓", at the header's text size rather
// than an icon's. Right-aligned cells would otherwise put it first.
const sortLabelSx = {
    fontSize: 'inherit',
    flexDirection: 'row',
    [`& .${tableSortLabelClasses.icon}`]: { fontSize: 12 },
};

// The outer cells line up with the card's own padding.
const edgeSx = (index: number, count: number) => ({
    ...(index === 0 && { pl: 3 }),
    ...(index === count - 1 && { pr: 3 }),
});

interface Column {
    header: string;
    sortKey?: SortKey;
    // Task takes what the others leave. Room for the sort arrow and, at the
    // edge, the card's padding.
    width?: number | string;
}

interface Props {
    colorOf: Map<string, string>;
    connectors: Map<string, string>;
    emptyText: string;
    layout: BucketLayout;
    onHover: (name: string | null) => void;
    onSelect: (name: string) => void;
    onSortChange: (key: SortKey) => void;
    rangeText: string;
    // This page's rows, or null while they load.
    rows: TaskUsageRow[] | null;
    selected: string | null;
    shortName: (name: string) => string;
    showCost: boolean;
    sort: SortKey;
}

export function TasksTable({
    colorOf,
    connectors,
    emptyText,
    layout,
    onHover,
    onSelect,
    onSortChange,
    rangeText,
    rows,
    selected,
    shortName,
    showCost,
    sort,
}: Props) {
    const usageColors = useUsageColors();
    const { buckets, grain } = layout;

    const measure = sort === 'hours' ? 'Task hours' : 'Data';
    const per = grain === 'DAILY' ? 'day' : 'month';

    const columns: Column[] = [
        { header: 'Task' },
        { header: `${measure} by ${per}`, width: '32%' },
        { header: 'Data', sortKey: 'gb', width: 96 },
        { header: 'Task hours', sortKey: 'hours', width: 128 },
        ...(showCost ? [{ header: 'Cost', width: 112 }] : []),
    ];

    const describe = (index: number, value: number) =>
        `${formatBucketShort(buckets[index], grain)} · ${
            sort === 'hours'
                ? `${formatNumber(value)} task hours`
                : formatGb(value)
        }`;

    return (
        <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
                aria-label={`Tasks, ${rangeText}`}
                onMouseLeave={() => onHover(null)}
                size="small"
                sx={{ minWidth: 640, tableLayout: 'fixed' }}
            >
                <TableHead>
                    <TableRow>
                        {columns.map(({ header, sortKey, width }, index) => (
                            <TableCell
                                align={index > 1 ? 'right' : 'left'}
                                key={header}
                                sortDirection={
                                    sortKey && sortKey === sort ? 'desc' : false
                                }
                                sx={{
                                    ...captionSx,
                                    fontSize: 12,
                                    fontWeight: 400,
                                    width,
                                    whiteSpace: 'nowrap',
                                    ...edgeSx(index, columns.length),
                                }}
                            >
                                {sortKey ? (
                                    <TableSortLabel
                                        IconComponent={ArrowDown}
                                        active={sortKey === sort}
                                        direction="desc"
                                        onClick={() => onSortChange(sortKey)}
                                        sx={sortLabelSx}
                                    >
                                        {header}
                                    </TableSortLabel>
                                ) : (
                                    header
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows === null ? (
                        Array.from({ length: SKELETON_ROWS }, (_, row) => (
                            <TableRow key={row}>
                                {columns.map(({ header }, index) => (
                                    <TableCell
                                        key={header}
                                        sx={{
                                            py: 1.5,
                                            ...edgeSx(index, columns.length),
                                        }}
                                    >
                                        <Skeleton />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : rows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                align="center"
                                colSpan={columns.length}
                                sx={{ ...captionSx, py: 3 }}
                            >
                                {emptyText}
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => {
                            const isSelected = row.name === selected;
                            const connector = connectors.get(row.name);
                            const kind = row.kind
                                ? [KIND_LABELS[row.kind], connector]
                                      .filter(Boolean)
                                      .join(' · ')
                                : 'No longer in the catalog';

                            return (
                                <TableRow
                                    hover
                                    key={row.name}
                                    onClick={() => onSelect(row.name)}
                                    onMouseEnter={() => onHover(row.name)}
                                    selected={isSelected}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell sx={{ py: 1.25, pl: 3 }}>
                                        {/* The row selects on click; the
                                            button lets a keyboard do it too. */}
                                        <ButtonBase
                                            aria-pressed={isSelected}
                                            sx={{
                                                display: 'flex',
                                                gap: 1,
                                                maxWidth: '100%',
                                                justifyContent: 'flex-start',
                                            }}
                                            title={row.name}
                                        >
                                            <Swatch
                                                color={
                                                    colorOf.get(row.name) ??
                                                    'action.disabled'
                                                }
                                            />

                                            <Typography
                                                component="span"
                                                noWrap
                                                sx={{ fontSize: 13 }}
                                            >
                                                {shortName(row.name)}
                                            </Typography>
                                        </ButtonBase>

                                        <Typography
                                            noWrap
                                            sx={{
                                                ...captionSx,
                                                fontSize: 12,
                                                pl: 2,
                                            }}
                                        >
                                            {kind}
                                        </Typography>
                                    </TableCell>

                                    <TableCell sx={{ py: 1.25 }}>
                                        <Sparkline
                                            color={
                                                sort === 'hours'
                                                    ? usageColors.hours
                                                    : usageColors.data
                                            }
                                            describe={describe}
                                            values={row.usage.map((amounts) =>
                                                amounts
                                                    ? sort === 'hours'
                                                        ? toHours(
                                                              amounts.seconds
                                                          )
                                                        : toGb(amounts.bytes)
                                                    : null
                                            )}
                                        />
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{ ...numericSx, fontSize: 13 }}
                                    >
                                        {formatGb(row.gb)}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{
                                            ...numericSx,
                                            fontSize: 13,
                                            pr: showCost ? undefined : 3,
                                        }}
                                    >
                                        {formatNumber(row.hours)}
                                    </TableCell>

                                    {showCost ? (
                                        <TableCell
                                            align="right"
                                            sx={{
                                                ...numericSx,
                                                fontSize: 13,
                                                pr: 3,
                                            }}
                                        >
                                            {formatCents(row.costCents ?? 0)}
                                        </TableCell>
                                    ) : null}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
