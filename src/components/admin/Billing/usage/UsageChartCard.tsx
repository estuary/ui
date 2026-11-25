import type { DateTime } from 'luxon';
import type {
    BucketLayout,
    UsagePeriod,
} from 'src/components/admin/Billing/usage/period';
import type { TaskUsageRow } from 'src/components/admin/Billing/usage/rows';
import type { ListRates } from 'src/components/admin/Billing/usage/UsageTab';
import type { CombinedError } from 'urql';

import { useCallback, useMemo } from 'react';

import { Box, Skeleton, Stack, Typography } from '@mui/material';

import { BillingCard } from 'src/components/admin/Billing/shared/BillingCard';
import {
    captionSx,
    CardHeader,
    numericSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import {
    formatCents,
    formatGb,
    formatHours,
} from 'src/components/admin/Billing/shared/format';
import { Swatch } from 'src/components/admin/Billing/shared/Swatch';
import { useUsageColors } from 'src/components/admin/Billing/shared/useUsageColors';
import {
    formatBucketShort,
    formatRange,
} from 'src/components/admin/Billing/usage/period';
import { sumBuckets } from 'src/components/admin/Billing/usage/rows';
import { UsageBarChart } from 'src/components/admin/Billing/usage/UsageBarChart';
import AlertBox from 'src/components/shared/AlertBox';

const totalSx = {
    ...numericSx,
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
};

interface Props {
    error: CombinedError | undefined;
    isFiltered: boolean;
    layout: BucketLayout;
    onSelectMonth: (start: DateTime) => void;
    period: UsagePeriod;
    rates: ListRates;
    // The rows matching the task filter, or null while they load.
    rows: TaskUsageRow[] | null;
}

export function UsageChartCard({
    error,
    isFiltered,
    layout,
    onSelectMonth,
    period,
    rates,
    rows,
}: Props) {
    const colors = useUsageColors();
    const { buckets, grain } = layout;

    const totals = useMemo(
        () => (rows ? sumBuckets(rows, buckets) : null),
        [buckets, rows]
    );

    const gb = rows?.reduce((total, row) => total + row.gb, 0) ?? 0;
    const hours = rows?.reduce((total, row) => total + row.hours, 0) ?? 0;
    const range = formatRange(period.from, period.to);

    const figures = [
        { label: 'Data', color: colors.data, value: formatGb(gb) },
        { label: 'Task hours', color: colors.hours, value: formatHours(hours) },
    ];

    // A month's bar opens that month, a day at a time.
    const openMonth = useCallback(
        (index: number) => onSelectMonth(buckets[index].start),
        [buckets, onSelectMonth]
    );

    return (
        <BillingCard label="Usage chart">
            <Stack spacing={2} sx={{ px: 3, pt: 2, pb: 1.75 }}>
                <Stack spacing={0.5}>
                    <CardHeader
                        title="Data and task hours"
                        caption={
                            isFiltered ? `${range} · matching tasks` : range
                        }
                    />

                    {error ? null : (
                        <Stack
                            direction="row"
                            sx={{ flexWrap: 'wrap', columnGap: 5, rowGap: 0.5 }}
                        >
                            {figures.map(({ label, color, value }) => (
                                <Stack key={label} spacing={0.25}>
                                    <Stack
                                        direction="row"
                                        spacing={0.75}
                                        sx={{ alignItems: 'center' }}
                                    >
                                        <Swatch color={color} />

                                        <Typography
                                            component="span"
                                            sx={captionSx}
                                        >
                                            {label}
                                        </Typography>
                                    </Stack>

                                    {rows ? (
                                        <Typography sx={totalSx}>
                                            {value}
                                        </Typography>
                                    ) : (
                                        <Skeleton
                                            sx={{ ...totalSx, width: 120 }}
                                        />
                                    )}
                                </Stack>
                            ))}
                        </Stack>
                    )}
                </Stack>

                {error ? (
                    <AlertBox short severity="error">
                        There was an error loading usage. Please try again
                        later.
                    </AlertBox>
                ) : totals ? (
                    <Box>
                        <UsageBarChart
                            ariaLabel={`Data and task hours, ${range}: ${figures
                                .map(({ value }) => value)
                                .join(' and ')}`}
                            buckets={buckets}
                            grain={grain}
                            onBucketClick={
                                grain === 'MONTHLY' ? openMonth : undefined
                            }
                            rates={rates}
                            totals={totals}
                        />

                        <Stack
                            direction="row"
                            sx={{
                                ...captionSx,
                                ...numericSx,
                                fontSize: 11,
                                justifyContent: 'space-between',
                                pt: 0.75,
                            }}
                        >
                            <span>{formatBucketShort(buckets[0], grain)}</span>
                            <span>
                                {formatBucketShort(
                                    buckets[buckets.length - 1],
                                    grain
                                )}
                            </span>
                        </Stack>
                    </Box>
                ) : (
                    <Skeleton height={182} variant="rounded" />
                )}

                {error ? null : (
                    <Typography sx={captionSx}>
                        {`Stacked at list rates, ${formatCents(rates.dataCents)} per GB and ${formatCents(rates.hoursCents)} per task hour, so both share one scale.`}
                    </Typography>
                )}
            </Stack>
        </BillingCard>
    );
}
