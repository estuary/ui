import type { EChartsOption } from 'echarts';
import type { UsageBucket } from 'src/components/admin/Billing/usage/period';
import type { ListRates } from 'src/components/admin/Billing/usage/UsageTab';
import type {
    UsageAmounts,
    UsageGrain,
} from 'src/hooks/billing/useTaskUsageStats';

import { useEffect, useMemo, useRef } from 'react';

import { useTheme } from '@mui/material';

import { BarChart } from 'echarts/charts';
import {
    AriaComponent,
    GridComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';

import {
    formatGb,
    formatHours,
} from 'src/components/admin/Billing/shared/format';
import { useChartTooltip } from 'src/components/admin/Billing/shared/useChartTooltip';
import { useUsageColors } from 'src/components/admin/Billing/shared/useUsageColors';
import { formatBucketLong } from 'src/components/admin/Billing/usage/period';
import { toGb, toHours } from 'src/components/admin/Billing/usage/rows';
import { useEChart } from 'src/components/graphs/useEChart';
import { diminishedTextColor } from 'src/context/Theme';

echarts.use([AriaComponent, BarChart, GridComponent, TooltipComponent]);

const swatch = (color: string) =>
    `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px;background:${color}"></span>`;

interface Props {
    ariaLabel: string;
    buckets: UsageBucket[];
    grain: UsageGrain;
    // Called with the bucket under a click anywhere in its column, as the
    // shadow pointer covers. Leave out for buckets that don't open.
    onBucketClick?: (index: number) => void;
    rates: ListRates;
    // Null for a bucket still to come.
    totals: (UsageAmounts | null)[];
}

// Data and task hours stacked at a rate each, so both share one scale.
export function UsageBarChart({
    ariaLabel,
    buckets,
    grain,
    onBucketClick,
    rates,
    totals,
}: Props) {
    const theme = useTheme();
    const { data: dataColor, hours: hoursColor } = useUsageColors();
    const tooltip = useChartTooltip();
    const { dataCents, hoursCents } = rates;

    const containerRef = useRef<HTMLDivElement>(null);

    const option = useMemo<EChartsOption>(() => {
        const values = totals.map((amounts) =>
            amounts
                ? {
                      data: toGb(amounts.bytes) * dataCents,
                      hours: toHours(amounts.seconds) * hoursCents,
                  }
                : null
        );
        const top =
            Math.max(
                ...values.map((value) => (value ? value.data + value.hours : 0))
            ) * 1.08 || 1;

        return {
            animationDuration: 300,
            // Labels the chart for assistive technology.
            aria: { enabled: true, label: { description: ariaLabel } },
            grid: { left: 0, right: 0, top: 4, bottom: 0 },
            xAxis: {
                type: 'category',
                data: buckets.map(({ key }) => key),
                show: false,
            },
            yAxis: { type: 'value', show: false, max: top },
            tooltip: {
                ...tooltip,
                formatter: (params) => {
                    const [first] = Array.isArray(params) ? params : [params];
                    const index = first.dataIndex;
                    const amounts = totals[index];
                    const title = `<div style="font-weight:500;margin-bottom:2px">${formatBucketLong(buckets[index], grain)}</div>`;

                    if (!amounts) {
                        return title;
                    }

                    return [
                        title,
                        `${swatch(dataColor)}Data ${formatGb(toGb(amounts.bytes))}<br>`,
                        `${swatch(hoursColor)}Task hours ${formatHours(toHours(amounts.seconds))}`,
                        onBucketClick
                            ? `<div style="color:${diminishedTextColor[theme.palette.mode]};margin-top:2px">Select to see days</div>`
                            : '',
                    ].join('');
                },
            },
            series: [
                {
                    name: 'Data',
                    type: 'bar',
                    stack: 'usage',
                    barCategoryGap: grain === 'DAILY' ? '16%' : '28%',
                    itemStyle: { color: dataColor },
                    data: values.map((value) => value?.data ?? null),
                },
                {
                    name: 'Task hours',
                    type: 'bar',
                    stack: 'usage',
                    itemStyle: {
                        color: hoursColor,
                        borderRadius: [2, 2, 0, 0],
                    },
                    data: values.map((value) => value?.hours ?? null),
                },
                {
                    // A sliver per day still to come, so the month reads whole.
                    name: 'Not yet',
                    type: 'bar',
                    stack: 'usage',
                    silent: true,
                    itemStyle: {
                        color: theme.palette.action.hover,
                        borderRadius: 1,
                    },
                    data: buckets.map(({ future }) =>
                        future ? top * 0.012 : null
                    ),
                },
            ],
        };
    }, [
        ariaLabel,
        buckets,
        dataCents,
        dataColor,
        grain,
        hoursCents,
        hoursColor,
        onBucketClick,
        theme.palette.action.hover,
        theme.palette.mode,
        tooltip,
        totals,
    ]);

    const chart = useEChart(containerRef, option);

    useEffect(() => {
        if (!chart || !onBucketClick) {
            return undefined;
        }

        const zr = chart.getZr();
        const columnAt = ({ offsetX, offsetY }: MouseOffset) => {
            if (!chart.containPixel('grid', [offsetX, offsetY])) {
                return null;
            }

            const point = chart.convertFromPixel({ seriesIndex: 0 }, [
                offsetX,
                offsetY,
            ]);
            const index = Array.isArray(point) ? Math.round(point[0]) : -1;

            return buckets[index] && !buckets[index].future ? index : null;
        };

        const onClick = (event: MouseOffset) => {
            const index = columnAt(event);

            if (index !== null) {
                onBucketClick(index);
            }
        };

        const onMove = (event: MouseOffset) => {
            zr.setCursorStyle(columnAt(event) === null ? 'default' : 'pointer');
        };

        zr.on('click', onClick);
        zr.on('mousemove', onMove);

        return () => {
            zr.off('click', onClick);
            zr.off('mousemove', onMove);
        };
    }, [buckets, chart, onBucketClick]);

    return <div ref={containerRef} style={{ height: 160 }} />;
}

interface MouseOffset {
    offsetX: number;
    offsetY: number;
}
