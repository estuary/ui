import type {
    ExportColumn,
    ExportGrouping,
} from 'src/components/admin/Billing/usage/csv';
import type {
    BucketLayout,
    UsagePeriod,
} from 'src/components/admin/Billing/usage/period';
import type { TaskUsageRow } from 'src/components/admin/Billing/usage/rows';
import type { ChargesByMonth } from 'src/hooks/billing/useTaskUsageCharges';
import type { UsageTask } from 'src/hooks/billing/useTaskUsageTasks';

import { useMemo, useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Skeleton,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from '@mui/material';

import { Download } from 'iconoir-react';

import {
    captionSx,
    numericSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import { countCsvRows, toCsv } from 'src/components/admin/Billing/usage/csv';
import {
    formatRange,
    getBucketLayout,
    isoDay,
    periodLabel,
} from 'src/components/admin/Billing/usage/period';
import { useUsageRows } from 'src/components/admin/Billing/usage/useUsageRows';
import AlertBox from 'src/components/shared/AlertBox';
import { codeBackground } from 'src/context/Theme';

const PREVIEW_ROWS = 4;

const COLUMN_LABELS: Record<ExportColumn, string> = {
    gb: 'Data (GB)',
    hours: 'Task hours',
    cost: 'Cost (USD)',
};

interface Props {
    billedFrom: string | null;
    // Null when costs aren't shown.
    charges: ChargesByMonth | null;
    layout: BucketLayout;
    onClose: () => void;
    period: UsagePeriod;
    rows: TaskUsageRow[];
    tasks: UsageTask[];
    tenant: string;
}

// The tab's period as CSV: one row per task per day or month.
export function ExportDialog({
    billedFrom,
    charges,
    layout,
    onClose,
    period,
    rows,
    tasks,
    tenant,
}: Props) {
    const theme = useTheme();

    const [grouping, setGrouping] = useState<ExportGrouping>(
        layout.grain === 'DAILY' ? 'day' : 'month'
    );
    const [unchecked, setUnchecked] = useState<ExportColumn[]>([]);

    const columns = (['gb', 'hours', 'cost'] as const).filter(
        (column) => column !== 'cost' || charges
    );
    const chosen = columns.filter((column) => !unchecked.includes(column));

    // A period read by month has no daily stats on hand, so rows by day read
    // them, only once asked for.
    const needsDays = grouping === 'day' && layout.grain === 'MONTHLY';
    // A monthly period has no days still to come, so its last day stands in
    // for today.
    const dailyLayout = useMemo(
        () => getBucketLayout(period, period.to, 'DAILY'),
        [period]
    );
    const daily = useUsageRows({
        tenant,
        tasks,
        period,
        layout: dailyLayout,
        charges,
        billedFrom,
        pause: !needsDays,
    });

    let source: {
        rows: TaskUsageRow[];
        buckets: BucketLayout['buckets'];
    } | null = { rows, buckets: layout.buckets };
    if (needsDays) {
        source = daily.rows
            ? { rows: daily.rows, buckets: dailyLayout.buckets }
            : null;
    }

    const from = isoDay(period.from);
    const to = isoDay(period.to);
    const fileName = `${tenant.replace(/\/$/, '')}-usage-${from}${
        from === to ? '' : `-to-${to}`
    }.csv`;

    // A plain button rather than `CsvDownload`, whose wrapper fires on both the
    // click and the keypress of a key that activates the button inside it, so
    // Enter downloads twice. Built on click: a year by day runs long.
    const download = () => {
        if (!source) {
            return;
        }

        // The byte order mark tells spreadsheets the file is UTF-8.
        const url = URL.createObjectURL(
            new Blob(
                [
                    '\ufeff',
                    toCsv(source.rows, source.buckets, grouping, chosen),
                ],
                { type: 'text/csv;charset=utf-8' }
            )
        );
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        // Some browsers start the download after this returns.
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        onClose();
    };

    return (
        <Dialog
            aria-labelledby="usage-export-title"
            fullWidth
            onClose={onClose}
            open
            slotProps={{ paper: { sx: { maxWidth: 520 } } }}
        >
            <DialogTitle id="usage-export-title">Export usage</DialogTitle>

            <DialogContent>
                <Stack spacing={2.5}>
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: 'baseline',
                            bgcolor: 'action.hover',
                            borderRadius: 1.5,
                            gap: 2,
                            justifyContent: 'space-between',
                            px: 1.5,
                            py: 1.25,
                        }}
                    >
                        <Typography component="span" sx={captionSx}>
                            Period
                        </Typography>

                        <Typography
                            component="span"
                            sx={{ ...numericSx, textAlign: 'right' }}
                        >
                            {`${periodLabel(period)} · ${formatRange(period.from, period.to)}`}
                        </Typography>
                    </Stack>

                    <Stack spacing={1}>
                        <Typography component="span" sx={captionSx}>
                            One row per
                        </Typography>

                        <ToggleButtonGroup
                            aria-label="One row per"
                            exclusive
                            onChange={(
                                _event,
                                value: ExportGrouping | null
                            ) => {
                                if (value) {
                                    setGrouping(value);
                                }
                            }}
                            size="small"
                            value={grouping}
                        >
                            <ToggleButton value="day">
                                Task per day
                            </ToggleButton>
                            <ToggleButton value="month">
                                Task per month
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    <Stack spacing={0.25}>
                        <Typography component="span" sx={captionSx}>
                            Columns
                        </Typography>

                        <Stack
                            direction="row"
                            sx={{ flexWrap: 'wrap', columnGap: 2.5 }}
                        >
                            {columns.map((column) => (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={chosen.includes(column)}
                                            onChange={(event) =>
                                                setUnchecked((current) =>
                                                    event.target.checked
                                                        ? current.filter(
                                                              (c) =>
                                                                  c !== column
                                                          )
                                                        : [...current, column]
                                                )
                                            }
                                            size="small"
                                        />
                                    }
                                    key={column}
                                    label={COLUMN_LABELS[column]}
                                />
                            ))}
                        </Stack>
                    </Stack>

                    <Stack spacing={0.75}>
                        <Stack
                            direction="row"
                            sx={{
                                ...captionSx,
                                gap: 2,
                                justifyContent: 'space-between',
                            }}
                        >
                            <span>Preview</span>

                            {source ? (
                                <Typography
                                    component="span"
                                    noWrap
                                    sx={{
                                        ...captionSx,
                                        ...numericSx,
                                        minWidth: 0,
                                    }}
                                    title={fileName}
                                >
                                    {`${countCsvRows(source.rows, source.buckets, grouping).toLocaleString('en-US')} rows · ${fileName}`}
                                </Typography>
                            ) : null}
                        </Stack>

                        {daily.error && needsDays ? (
                            <AlertBox short severity="error">
                                There was an error loading usage by day. Please
                                try again later.
                            </AlertBox>
                        ) : (
                            <Box
                                component="pre"
                                sx={{
                                    m: 0,
                                    px: 1.5,
                                    py: 1.25,
                                    borderRadius: 1,
                                    bgcolor: codeBackground[theme.palette.mode],
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                    lineHeight: 1.6,
                                    overflowX: 'auto',
                                }}
                            >
                                {source ? (
                                    `${toCsv(
                                        source.rows,
                                        source.buckets,
                                        grouping,
                                        chosen,
                                        PREVIEW_ROWS
                                    )}\n…`
                                ) : (
                                    <Skeleton height={96} variant="rounded" />
                                )}
                            </Box>
                        )}
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="text">
                    Cancel
                </Button>

                <Button
                    disabled={!source}
                    onClick={download}
                    startIcon={<Download height={16} width={16} />}
                    variant="contained"
                >
                    Download CSV
                </Button>
            </DialogActions>
        </Dialog>
    );
}
