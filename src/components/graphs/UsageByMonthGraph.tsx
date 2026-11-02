import type { EChartsOption } from 'echarts';

import { useEffect, useMemo, useState } from 'react';
import useConstant from 'use-constant';

import { useTheme } from '@mui/material';

import { eachMonthOfInterval, sub } from 'date-fns';
import { BarChart } from 'echarts/charts';
import {
    GridComponent,
    LegendComponent,
    MarkLineComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import useLegendConfig from 'src/components/graphs/useLegendConfig';
import useTooltipConfig from 'src/components/graphs/useTooltipConfig';
import { eChartsColors } from 'src/context/Theme';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import {
    CARD_AREA_HEIGHT,
    stripTimeFromDate,
    USAGE_GRAPH_MONTHS,
} from 'src/utils/billing-utils';

const chartContainerId = 'data-by-month';

const itemStyle = { borderRadius: [4, 4, 0, 0] };

function UsageByMonthGraph() {
    const theme = useTheme();
    const locale = navigator.language || 'en-US';
    const tooltipConfig = useTooltipConfig();
    const legendConfig = useLegendConfig([{ name: 'Data' }, { name: 'Hours' }]);

    const { invoices, isLoading } = useBillingInvoices({
        months: USAGE_GRAPH_MONTHS,
    });

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    const today = useConstant(() => new Date());

    const months = useMemo(() => {
        const startDate = sub(today, { months: USAGE_GRAPH_MONTHS - 1 });

        return eachMonthOfInterval({
            start: startDate,
            end: today,
        }).map((date) => date.toLocaleDateString(locale, { month: 'short' }));
    }, [locale, today]);

    const seriesConfigs = useMemo(
        () =>
            invoices
                .filter(({ invoiceType }) => invoiceType !== 'MANUAL')
                .map(({ dateStart, extra }) => ({
                    month: stripTimeFromDate(dateStart).toLocaleDateString(
                        locale,
                        { month: 'short' }
                    ),
                    gb: extra?.processed_data_gb ?? 0,
                    hours: extra?.task_usage_hours ?? 0,
                })),
        [invoices, locale]
    );

    useEffect(() => {
        if (!isLoading && invoices.length > 0) {
            if (!myChart) {
                echarts.use([
                    GridComponent,
                    BarChart,
                    CanvasRenderer,
                    UniversalTransition,
                    MarkLineComponent,
                    TooltipComponent,
                    LegendComponent,
                ]);

                const chartDom = document.getElementById(chartContainerId);

                setMyChart(chartDom && echarts.init(chartDom));
            }

            const resizeListener = () => {
                myChart?.resize();
            };

            window.addEventListener('resize', resizeListener);

            return () => window.removeEventListener('resize', resizeListener);
        }

        // Appease the linter gods
        return undefined;
    }, [
        invoices,
        isLoading,
        locale,
        legendConfig,
        months,
        myChart,
        seriesConfigs,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    useEffect(() => {
        const option: EChartsOption = {
            xAxis: {
                type: 'category',
                data: months,
                axisPointer: { type: 'shadow' },
            },
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        formatter: '{value} GB',
                        color: eChartsColors.medium[0],
                        fontSize: 14,
                        fontWeight: 'bold',
                    },
                    minInterval: 0.001,
                    splitLine: {
                        show: false,
                    },
                },
                {
                    type: 'value',
                    axisLabel: {
                        formatter: '{value} hours',
                        color: eChartsColors.medium[1],
                        fontSize: 14,
                        fontWeight: 'bold',
                    },
                    minInterval: 0.001,
                },
            ],
            series: [
                {
                    name: 'Data',
                    type: 'bar',
                    barMinHeight: 3,
                    color: eChartsColors.medium[0],
                    data: seriesConfigs.map(({ month, gb }) => [
                        month,
                        gb.toFixed(3),
                    ]),
                    itemStyle,
                    tooltip: {
                        valueFormatter: (value) => {
                            return `${String(value)} GB`;
                        },
                    },
                },
                {
                    name: 'Hours',
                    type: 'bar',
                    barMinHeight: 3,
                    color: eChartsColors.medium[1],
                    data: seriesConfigs.map(({ month, hours }) => [
                        month,
                        hours.toFixed(3),
                    ]),
                    itemStyle,
                    tooltip: {
                        valueFormatter: (value) => {
                            return `${String(value)} hours`;
                        },
                    },
                    yAxisIndex: 1,
                },
            ],
            textStyle: {
                color: theme.palette.text.primary,
            },
            grid: {
                left: 10,
                top: 30,
                right: 10,
                bottom: 10,
                containLabel: true,
            },
            tooltip: tooltipConfig,
            legend: {
                ...legendConfig,
                top: 0,
            },
        };

        myChart?.setOption(option);
    }, [
        legendConfig,
        months,
        myChart,
        seriesConfigs,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    return <div id={chartContainerId} style={{ height: CARD_AREA_HEIGHT }} />;
}

export default UsageByMonthGraph;
