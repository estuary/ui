import type {
    ShareMetric,
    TaskUsageRow,
} from 'src/components/admin/Billing/usage/rows';

import {
    alpha,
    Box,
    Button,
    ButtonBase,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import {
    captionSx,
    numericSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import {
    formatCents,
    formatGb,
    formatHours,
} from 'src/components/admin/Billing/shared/format';
import {
    formatShare,
    shareSegments,
} from 'src/components/admin/Billing/usage/rows';

const METRICS: {
    metric: ShareMetric;
    label: string;
    format: (value: number) => string;
}[] = [
    { metric: 'gb', label: 'Data', format: formatGb },
    { metric: 'hours', label: 'Task hours', format: formatHours },
    { metric: 'costCents', label: 'Cost', format: formatCents },
];

interface Props {
    // Tasks with a color of their own, in order.
    colorOf: Map<string, string>;
    highlighted: string | null;
    onClear: () => void;
    onHover: (name: string | null) => void;
    onSelect: (name: string) => void;
    // Every row, filtered or not: each bar splits the whole total.
    rows: TaskUsageRow[];
    selected: string | null;
    shortName: (name: string) => string;
    showCost: boolean;
}

// Each total split by task: a segment per colored task, plus the highlighted
// task if it has no color, and one gray segment for the rest.
export function ShareBars({
    colorOf,
    highlighted,
    onClear,
    onHover,
    onSelect,
    rows,
    selected,
    shortName,
    showCost,
}: Props) {
    const theme = useTheme();

    const highlightedRow = highlighted
        ? rows.find(({ name }) => name === highlighted)
        : undefined;

    const named = [...colorOf.keys()];
    if (highlightedRow && !colorOf.has(highlightedRow.name)) {
        named.push(highlightedRow.name);
    }

    const otherCount =
        rows.length -
        named.filter((name) => rows.some((row) => row.name === name)).length;

    const segmentColor = (name: string) => {
        const color = colorOf.get(name);

        if (!color) {
            return theme.palette.text.primary;
        }

        return !highlighted || highlighted === name
            ? color
            : alpha(color, 0.25);
    };

    let subtitle = 'Select a task to compare';
    if (highlightedRow) {
        subtitle = highlightedRow.name === selected ? 'Selected' : '';
    }

    return (
        <Stack
            onMouseLeave={() => onHover(null)}
            spacing={1.5}
            sx={{ pt: 1, pb: 0.5 }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: 'space-between',
                    minHeight: 22,
                }}
            >
                <Typography noWrap sx={{ fontSize: 14, fontWeight: 500 }}>
                    {highlightedRow
                        ? shortName(highlightedRow.name)
                        : 'Share of each total'}
                </Typography>

                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center', flex: 'none' }}
                >
                    <Typography component="span" sx={captionSx}>
                        {subtitle}
                    </Typography>

                    {selected ? (
                        <Button
                            onClick={onClear}
                            size="small"
                            variant="text"
                            sx={{ minWidth: 0, p: 0, fontSize: 13 }}
                        >
                            Clear
                        </Button>
                    ) : null}
                </Stack>
            </Stack>

            {METRICS.filter(
                ({ metric }) => showCost || metric !== 'costCents'
            ).map(({ metric, label, format }) => {
                const { total, segments } = shareSegments(rows, named, metric);
                const value = highlightedRow?.[metric] ?? 0;

                return (
                    <Stack key={metric} spacing={0.75}>
                        <Stack
                            direction="row"
                            sx={{ gap: 2, justifyContent: 'space-between' }}
                        >
                            <Typography component="span" sx={captionSx}>
                                {label}
                            </Typography>

                            <Typography
                                component="span"
                                sx={{
                                    ...numericSx,
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}
                            >
                                {highlightedRow
                                    ? `${format(value)} · ${formatShare(value, total)}`
                                    : format(total)}
                            </Typography>
                        </Stack>

                        <Stack
                            direction="row"
                            sx={{
                                gap: '2px',
                                height: 12,
                                borderRadius: '3px',
                                overflow: 'hidden',
                                bgcolor: segments.length
                                    ? undefined
                                    : 'action.hover',
                            }}
                        >
                            {segments.map(({ name, value: part }) => {
                                const flex = `${part / total} 1 0`;
                                const share = `${format(part)}, ${formatShare(part, total)} of ${label.toLowerCase()}`;

                                return name ? (
                                    <ButtonBase
                                        aria-label={`${shortName(name)}: ${share}`}
                                        key={name}
                                        onClick={() => onSelect(name)}
                                        onMouseEnter={() => onHover(name)}
                                        sx={{
                                            flex,
                                            bgcolor: segmentColor(name),
                                        }}
                                        title={`${shortName(name)}: ${share}`}
                                    />
                                ) : (
                                    <Box
                                        key="other"
                                        onMouseEnter={() => onHover(null)}
                                        sx={{
                                            flex,
                                            bgcolor: highlighted
                                                ? 'action.hover'
                                                : 'action.disabledBackground',
                                        }}
                                        title={`${otherCount} other ${otherCount === 1 ? 'task' : 'tasks'}: ${share}`}
                                    />
                                );
                            })}
                        </Stack>
                    </Stack>
                );
            })}
        </Stack>
    );
}
