import { useTheme } from '@mui/material';
import useLegendConfig from 'components/graphs/useLegendConfig';
import {
    eachMonthOfInterval,
    isWithinInterval,
    startOfMonth,
    sub,
} from 'date-fns';
import { EChartsOption } from 'echarts';
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
import { useBilling_hydrated, useBilling_invoices } from 'stores/Billing/hooks';
import useConstant from 'use-constant';
import { CARD_AREA_HEIGHT, stripTimeFromDate } from 'utils/billing-utils';
import useTooltipConfig from './useTooltipConfig';

const chartContainerId = 'data-by-month';

function UsageByMonthGraph() {
    const theme = useTheme();
    const intl = useIntl();
    const tooltipConfig = useTooltipConfig();
    const legendConfig = useLegendConfig([{ name: 'Data' }, { name: 'Hours' }]);

    const billingStoreHydrated = useBilling_hydrated();
    const invoices = useBilling_invoices();

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

        const filteredHistory = invoices.filter(
            ({ invoice_type, date_start, date_end }) => {
                return (
                    (invoice_type === 'current_month' ||
                        invoice_type === 'usage') &&
                    isWithinInterval(stripTimeFromDate(date_start), {
                        start: startDate,
                        end: today,
                    }) &&
                    isWithinInterval(stripTimeFromDate(date_end), {
                        start: startDate,
                        end: today,
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
                        valueFormatter: (value) => {
                            return `${value} GB`;
                        },
                    },
                },
                {
                    name: 'Hours',
                    type: 'bar',
                    barMinHeight: 3,
                    data: seriesConfigs.hours.map(({ month, data }) => [
                        month,
                        data.toFixed(3),
                    ]),
                    tooltip: {
                        valueFormatter: (value) => {
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
                right: 10,
                bottom: 30,
                containLabel: true,
            },
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                ...legendConfig,
                bottom: 0,
            },
        };

        myChart?.setOption(option);
    }, [
        legendConfig,
        months,
        myChart,
        seriesConfigs.data,
        seriesConfigs.hours,
        theme.palette.text.primary,
    ]);

    return <div id={chartContainerId} style={{ height: CARD_AREA_HEIGHT }} />;
}

export default UsageByMonthGraph;
