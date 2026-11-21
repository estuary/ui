import type { EChartsOption } from 'echarts';
import type { TenantBillingMonthToDateQuery } from 'src/gql-types/graphql';
import type { useBillingMonthToDate } from 'src/hooks/billing/useBillingMonthToDate';

import { useMemo, useRef } from 'react';

import { alpha, Box, lighten, Skeleton, Stack, useTheme } from '@mui/material';

import { BarChart } from 'echarts/charts';
import {
    AriaComponent,
    GridComponent,
    MarkLineComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';

import { captionSx } from 'src/components/admin/Billing/shared/CardHeader';
import {
    formatDay,
    formatMonthName,
    formatWholeCents,
} from 'src/components/admin/Billing/shared/format';
import { Swatch } from 'src/components/admin/Billing/shared/Swatch';
import { useChartTooltip } from 'src/components/admin/Billing/shared/useChartTooltip';
import { useUsageColors } from 'src/components/admin/Billing/shared/useUsageColors';
import { useEChart } from 'src/components/graphs/useEChart';
import AlertBox from 'src/components/shared/AlertBox';
import { warningMain } from 'src/context/Theme';

echarts.use([
    AriaComponent,
    BarChart,
    GridComponent,
    MarkLineComponent,
    TooltipComponent,
]);

const CHART_HEIGHT = 120;

type Day = NonNullable<
    NonNullable<
        TenantBillingMonthToDateQuery['tenant']
    >['billing']['monthToDate']
>['days'][number];

const describeDay = ({ date, chargesCents, projected }: Day) =>
    projected
        ? `${formatDay(date)} · about ${formatWholeCents(chargesCents)} projected`
        : `${formatDay(date)} · ${formatWholeCents(chargesCents)} to date`;

interface ChargesBarsProps {
    days: Day[];
    // Null when no spend alert is on.
    alertCents: number | null;
}

// A bar per day of the month for the charges through that day, projected
// after today, with the spend alert's amount as a dashed line.
function ChargesBars({ days, alertCents }: ChargesBarsProps) {
    const theme = useTheme();
    const { data: dataColor } = useUsageColors();
    const tooltip = useChartTooltip();

    const containerRef = useRef<HTMLDivElement>(null);

    const option = useMemo<EChartsOption>(() => {
        const projectedColor = theme.palette.action.disabledBackground;
        const alertColor =
            theme.palette.mode === 'dark'
                ? warningMain
                : theme.palette.warning.main;
        const last = days.at(-1);
        const toDate = days.filter(({ projected }) => !projected).at(-1);
        const top =
            Math.max(last?.chargesCents ?? 0, alertCents ?? 0) * 1.08 || 1;

        return {
            animationDuration: 300,
            aria: {
                enabled: true,
                label: {
                    description:
                        last && toDate
                            ? `Charges through ${formatMonthName(toDate.date)}: ${formatWholeCents(toDate.chargesCents)} to date, about ${formatWholeCents(last.chargesCents)} projected by ${formatDay(last.date)}.`
                            : undefined,
                },
            },
            grid: { left: 0, right: 0, top: 4, bottom: 0 },
            xAxis: {
                type: 'category',
                data: days.map(({ date }) => date),
                show: false,
            },
            yAxis: { type: 'value', show: false, min: 0, max: top },
            tooltip: {
                ...tooltip,
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: { color: theme.palette.action.hover },
                },
                formatter: (params) => {
                    const [first] = Array.isArray(params) ? params : [params];
                    return describeDay(days[first.dataIndex]);
                },
            },
            series: [
                {
                    type: 'bar',
                    barCategoryGap: '14%',
                    barMinHeight: 2,
                    data: days.map(({ chargesCents, projected }) => ({
                        // Credits apply from the first day, so the charges
                        // through an early day can be negative. Those bars
                        // sit at zero, and the tooltip has the amount.
                        value: Math.max(0, chargesCents),
                        itemStyle: {
                            color: projected ? projectedColor : dataColor,
                            borderRadius: [2, 2, 0, 0],
                        },
                        emphasis: {
                            itemStyle: {
                                color: projected
                                    ? theme.palette.action.disabled
                                    : lighten(dataColor, 0.4),
                            },
                        },
                    })),
                    markLine:
                        alertCents === null
                            ? undefined
                            : {
                                  silent: true,
                                  symbol: 'none',
                                  animation: false,
                                  lineStyle: {
                                      type: 'dashed',
                                      width: 1,
                                      color: alpha(alertColor, 0.75),
                                  },
                                  label: {
                                      position: 'insideEndTop',
                                      formatter: `Alert ${formatWholeCents(alertCents)}`,
                                      color: alpha(alertColor, 0.9),
                                      fontSize: 11,
                                      distance: 2,
                                  },
                                  data: [{ yAxis: alertCents }],
                              },
                },
            ],
        };
    }, [alertCents, dataColor, days, theme, tooltip]);

    useEChart(containerRef, option);

    return <Box ref={containerRef} sx={{ height: CHART_HEIGHT }} />;
}

interface Props {
    monthToDate: ReturnType<typeof useBillingMonthToDate>;
    // The spend alert's amount, or null while it's off.
    alertCents: number | null;
}

export function ThisMonthChart({
    monthToDate: { monthToDate, error },
    alertCents,
}: Props) {
    const theme = useTheme();
    const { data: dataColor } = useUsageColors();

    if (error) {
        return (
            <Box sx={{ px: 3, pt: 1.5, pb: 1 }}>
                <AlertBox short severity="error">
                    There was an error loading this month&apos;s charges. Please
                    try again later.
                </AlertBox>
            </Box>
        );
    }

    const days = monthToDate?.days ?? [];
    const first = days.at(0);
    const last = days.at(-1);

    // The free tier and the trial credit each day in full, which leaves no
    // charges to chart.
    if (monthToDate && days.every(({ chargesCents }) => chargesCents <= 0)) {
        return null;
    }

    return (
        <Box sx={{ px: 3, pt: 1.5, pb: 1 }}>
            {monthToDate ? (
                <ChargesBars days={days} alertCents={alertCents} />
            ) : (
                <Skeleton variant="rounded" height={CHART_HEIGHT} />
            )}

            <Stack
                direction="row"
                sx={{
                    ...captionSx,
                    justifyContent: 'space-between',
                    pt: 0.75,
                    fontSize: 11,
                }}
            >
                <span>{first ? formatDay(first.date) : null}</span>

                <Stack direction="row" spacing={1.75}>
                    <Stack
                        direction="row"
                        spacing={0.625}
                        sx={{ alignItems: 'center' }}
                    >
                        <Swatch color={dataColor} />
                        <span>To date</span>
                    </Stack>
                    <Stack
                        direction="row"
                        spacing={0.625}
                        sx={{ alignItems: 'center' }}
                    >
                        <Swatch
                            color={theme.palette.action.disabledBackground}
                        />
                        <span>Projected</span>
                    </Stack>
                </Stack>

                <span>{last ? formatDay(last.date) : null}</span>
            </Stack>
        </Box>
    );
}
