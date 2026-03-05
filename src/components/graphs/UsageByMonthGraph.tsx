import type { EChartsOption } from 'echarts';

import { useEffect, useMemo, useState } from 'react';
import useConstant from 'use-constant';

import { useTheme } from '@mui/material';

import {
    eachMonthOfInterval,
    endOfMonth,
    isWithinInterval,
    startOfMonth,
    sub,
} from 'date-fns';
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
import { useIntl } from 'react-intl';

import useLegendConfig from 'src/components/graphs/useLegendConfig';
import useTooltipConfig from 'src/components/graphs/useTooltipConfig';
import { eChartsColors } from 'src/context/Theme';
import { useBillingStore } from 'src/stores/Billing/Store';
import { CARD_AREA_HEIGHT, stripTimeFromDate } from 'src/utils/billing-utils';

const chartContainerId = 'data-by-month';

const itemStyle = { borderRadius: [4, 4, 0, 0] };

function UsageByMonthGraph() {
    const theme = useTheme();
    const intl = useIntl();
    const tooltipConfig = useTooltipConfig();
    const legendConfig = useLegendConfig([{ name: 'Data' }, { name: 'Hours' }]);

    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const invoices = useBillingStore((state) => state.invoices);

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    const today = useConstant(() => new Date());

    const months = useMemo(() => {
        const startDate = sub(today, { months: 5 });

        return eachMonthOfInterval({
            start: startDate,
            end: today,
        }).map((date) => intl.formatDate(date, { month: 'short' }));
    }, [intl, today]);

    const seriesConfigs = useMemo(() => {
        const startDate = startOfMonth(sub(today, { months: 5 }));
        const endDate = endOfMonth(today);

        const filteredHistory = invoices.filter(
            ({ invoice_type, date_start, date_end }) => {
                return (
                    (invoice_type === 'final' || invoice_type === 'preview') &&
                    isWithinInterval(stripTimeFromDate(date_start), {
                        start: startDate,
                        end: endDate,
                    }) &&
                    isWithinInterval(stripTimeFromDate(date_end), {
                        start: startDate,
                        end: endDate,
                    })
                );
            }
        );

        const data_series = filteredHistory.flatMap(({ date_start, extra }) => {
            const billedMonth = stripTimeFromDate(date_start);
            const month = intl.formatDate(billedMonth, { month: 'short' });

            return { month, data: extra?.processed_data_gb ?? 0 };
        });

        const hours_series = filteredHistory.flatMap(
            ({ date_start, extra }) => {
                const billedMonth = stripTimeFromDate(date_start);
                const month = intl.formatDate(billedMonth, { month: 'short' });

                return { month, data: extra?.task_usage_hours ?? 0 };
            }
        );

        return { data: data_series, hours: hours_series };
    }, [invoices, intl, today]);

    useEffect(() => {
        if (billingStoreHydrated && invoices.length > 0) {
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
        billingStoreHydrated,
        intl,
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
                        formatter: intl.messages[
                            'admin.billing.graph.usageByMonth.dataFormatter'
                        ] as string,
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
                        formatter: intl.messages[
                            'admin.billing.graph.usageByMonth.hoursFormatter'
                        ] as string,
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
                    data: seriesConfigs.data.map(({ month, data }) => [
                        month,
                        data.toFixed(3),
                    ]),
                    itemStyle,
                    tooltip: {
                        valueFormatter: (value) => {
                            return intl.formatMessage(
                                {
                                    id: 'admin.billing.graph.usageByMonth.dataFormatter',
                                },
                                {
                                    value: String(value),
                                }
                            );
                        },
                    },
                },
                {
                    name: 'Hours',
                    type: 'bar',
                    barMinHeight: 3,
                    color: eChartsColors.medium[1],
                    data: seriesConfigs.hours.map(({ month, data }) => [
                        month,
                        data.toFixed(3),
                    ]),
                    itemStyle,
                    tooltip: {
                        valueFormatter: (value) => {
                            return intl.formatMessage(
                                {
                                    id: 'admin.billing.graph.usageByMonth.hoursFormatter',
                                },
                                {
                                    value: String(value),
                                }
                            );
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
        intl,
        legendConfig,
        months,
        myChart,
        seriesConfigs.data,
        seriesConfigs.hours,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    return <div id={chartContainerId} style={{ height: CARD_AREA_HEIGHT }} />;
}

export default UsageByMonthGraph;
