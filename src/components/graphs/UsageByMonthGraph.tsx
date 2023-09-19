import { useTheme } from '@mui/material';
import {
    eachMonthOfInterval,
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
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_billingHistory,
    useBilling_hydrated,
} from 'stores/Billing/hooks';
import useConstant from 'use-constant';
import { CARD_AREA_HEIGHT, stripTimeFromDate } from 'utils/billing-utils';
import useTooltipConfig from './useTooltipConfig';

const chartContainerId = 'data-by-month';

function UsageByMonthGraph() {
    const theme = useTheme();
    const intl = useIntl();
    const tooltipConfig = useTooltipConfig();

    const billingStoreHydrated = useBilling_hydrated();
    const billingHistory = useBilling_billingHistory();

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

        const filteredHistory = billingHistory.filter(({ billed_month }) => {
            const billedMonth = stripTimeFromDate(billed_month);

            return isWithinInterval(billedMonth, {
                start: startDate,
                end: today,
            });
        });

        const data_series = filteredHistory.flatMap(
            ({ billed_month, processed_data_gb }) => {
                const billedMonth = stripTimeFromDate(billed_month);
                const month = intl.formatDate(billedMonth, { month: 'short' });

                return { month, data: processed_data_gb ?? 0 };
            }
        );

        const hours_series = filteredHistory.flatMap(
            ({ billed_month, task_usage_hours }) => {
                const billedMonth = stripTimeFromDate(billed_month);
                const month = intl.formatDate(billedMonth, { month: 'short' });

                return { month, data: task_usage_hours ?? 0 };
            }
        );

        return { data: data_series, hours: hours_series };
    }, [billingHistory, intl, today]);

    useEffect(() => {
        if (billingStoreHydrated && billingHistory.length > 0) {
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

            window.addEventListener('resize', () => {
                myChart?.resize();
            });

            const option = {
                xAxis: {
                    type: 'category',
                    data: months,
                    axisPointer: { type: 'shadow' },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '',
                        axisLabel: {
                            formatter: '{value} GB',
                        },
                        minInterval: 0.001,
                        splitLine: {
                            show: false,
                        },
                    },
                    {
                        type: 'value',
                        name: '',
                        axisLabel: {
                            formatter: '{value} Hours',
                        },
                        minInterval: 0.001,
                    },
                ],
                series: [
                    {
                        name: 'Data',
                        type: 'bar',
                        barMinHeight: 3,
                        data: seriesConfigs.data.map(({ month, data }) => [
                            month,
                            data.toFixed(3),
                        ]),
                        tooltip: {
                            valueFormatter: (value: number) => {
                                return `${value} GB`;
                            },
                        },
                    },
                    {
                        name: 'Hours',
                        type: 'bar',
                        stack: 'Task Hours',
                        barMinHeight: 3,
                        data: seriesConfigs.hours.map(({ month, data }) => [
                            month,
                            data.toFixed(3),
                        ]),
                        tooltip: {
                            valueFormatter: (value: number) => {
                                return `${value} Hours`;
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
                    top: 10,
                    right: 50,
                    bottom: 30,
                    containLabel: true,
                },
                tooltip: {
                    trigger: 'axis',
                },
                legend: {
                    data: ['Data', 'Hours'],
                    textStyle: {
                        color: theme.palette.text.primary,
                    },
                    bottom: 0,
                },
            };

            myChart?.setOption(option);
        }
    }, [
        billingHistory,
        billingStoreHydrated,
        intl,
        months,
        myChart,
        seriesConfigs,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    return <div id={chartContainerId} style={{ height: CARD_AREA_HEIGHT }} />;
}

export default UsageByMonthGraph;
