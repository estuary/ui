import type { SeriesConfig } from 'src/utils/billing-utils';

import { useEffect, useMemo, useRef, useState } from 'react';
import useConstant from 'use-constant';

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
    MarkLineComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import {
    getTooltipItem,
    getTooltipTitle,
} from 'src/components/graphs/tooltips';
import useTooltipConfig from 'src/components/graphs/useTooltipConfig';
import { defaultOutlineColor } from 'src/context/Theme';
import { useBillingStore } from 'src/stores/Billing/Store';
import { CARD_AREA_HEIGHT, stripTimeFromDate } from 'src/utils/billing-utils';

const chartContainerId = 'task-hours-by-month';

function TaskHoursByMonthGraph() {
    const theme = useTheme();
    const intl = useIntl();
    const tooltipConfig = useTooltipConfig();

    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const invoices = useBillingStore((state) => state.invoices);

    const resizeListener = useRef<EventListener | null>(null);
    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    const today = useConstant(() => new Date());

    const months = useMemo(() => {
        const startDate = sub(today, { months: 5 });

        return eachMonthOfInterval({
            start: startDate,
            end: today,
        }).map((date) => intl.formatDate(date, { month: 'short' }));
    }, [intl, today]);

    const seriesConfig: SeriesConfig[] = useMemo(() => {
        const startDate = startOfMonth(sub(today, { months: 5 }));

        return invoices
            .filter(({ invoice_type, date_start, date_end }) => {
                return (
                    (invoice_type === 'final' || invoice_type === 'preview') &&
                    isWithinInterval(stripTimeFromDate(date_start), {
                        start: startDate,
                        end: today,
                    }) &&
                    isWithinInterval(stripTimeFromDate(date_end), {
                        start: startDate,
                        end: today,
                    })
                );
            })
            .map(({ date_start, extra }) => {
                const billedMonth = stripTimeFromDate(date_start);
                const month = intl.formatDate(billedMonth, { month: 'short' });

                return {
                    seriesName: date_start,
                    data: [[month, extra?.task_usage_hours ?? 0]],
                };
            });
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
                ]);

                const chartDom = document.getElementById(chartContainerId);

                setMyChart(chartDom && echarts.init(chartDom));
            }

            const option = {
                xAxis: {
                    type: 'category',
                    data: months,
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            color: defaultOutlineColor[theme.palette.mode],
                        },
                    },
                    minInterval: 1,
                },
                series: seriesConfig.map(({ seriesName, data }) => ({
                    name: seriesName,
                    type: 'bar',
                    stack: 'Task Count',
                    barMinHeight: 3,
                    data,
                })),
                textStyle: {
                    color: theme.palette.text.primary,
                },
                tooltip: {
                    ...tooltipConfig,
                    formatter: (tooltipConfigs: any[]) => {
                        let content: string | undefined;

                        tooltipConfigs.forEach((config) => {
                            const taskCount = config.value[1];
                            const formattedValue = intl.formatMessage(
                                {
                                    id: 'admin.billing.graph.taskHoursByMonth.formatValue',
                                },
                                { taskUsage: taskCount }
                            );

                            const tooltipItem = getTooltipItem(
                                config.marker,
                                formattedValue
                            );

                            if (content) {
                                content = `${content}${tooltipItem}`;
                            } else {
                                const tooltipTitle =
                                    invoices
                                        .map(({ date_start }) => {
                                            const billedMonth =
                                                stripTimeFromDate(date_start);

                                            return intl.formatDate(
                                                billedMonth,
                                                {
                                                    month: 'short',
                                                    year: 'numeric',
                                                }
                                            );
                                        })
                                        .find((date) =>
                                            date.includes(config.axisValueLabel)
                                        ) ?? config.axisValueLabel;

                                content = `${getTooltipTitle(
                                    tooltipTitle
                                )}${tooltipItem}`;
                            }
                        });

                        return content;
                    },
                },
                grid: {
                    left: 30,
                    top: 15,
                    right: 50,
                    bottom: 0,
                    containLabel: true,
                },
            };

            resizeListener.current = () => myChart?.resize();
            window.addEventListener('resize', resizeListener.current);

            myChart?.setOption(option);
        }
    }, [
        invoices,
        billingStoreHydrated,
        intl,
        months,
        myChart,
        seriesConfig,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    useUnmount(() => {
        if (resizeListener.current) {
            window.removeEventListener('resize', resizeListener.current);
        }
    });

    return <div id={chartContainerId} style={{ height: CARD_AREA_HEIGHT }} />;
}

export default TaskHoursByMonthGraph;
