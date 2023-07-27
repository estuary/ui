import { useTheme } from '@mui/material';
import { defaultOutlineColor } from 'context/Theme';
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
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_billingHistory,
    useBilling_hydrated,
} from 'stores/Billing/hooks';
import useConstant from 'use-constant';
import {
    CARD_AREA_HEIGHT,
    SeriesConfig,
    SeriesNames,
    stripTimeFromDate,
} from 'utils/billing-utils';
import { getTooltipItem, getTooltipTitle } from './tooltips';
import useTooltipConfig from './useTooltipConfig';

function TaskHoursByMonthGraph() {
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

    const seriesConfig: SeriesConfig[] = useMemo(() => {
        const startDate = startOfMonth(sub(today, { months: 5 }));

        return billingHistory
            .filter(({ billed_month }) => {
                const billedMonth = stripTimeFromDate(billed_month);

                return isWithinInterval(billedMonth, {
                    start: startDate,
                    end: today,
                });
            })
            .map(({ billed_month, max_concurrent_tasks }) => {
                const billedMonth = stripTimeFromDate(billed_month);
                const month = intl.formatDate(billedMonth, { month: 'short' });

                return {
                    seriesName: billed_month,
                    data: [[month, max_concurrent_tasks]],
                };
            });
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
                ]);

                const chartDom = document.getElementById('task-hours-by-month');

                setMyChart(chartDom && echarts.init(chartDom));
            }

            window.addEventListener('resize', () => {
                myChart?.resize();
            });

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
                    barMinHeight: seriesName === SeriesNames.INCLUDED ? 3 : 0,
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
                                    id: 'admin.billing.graph.taskHoursByMonth.tooltip.datum',
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
                                    billingHistory
                                        .map(({ billed_month }) => {
                                            const billedMonth =
                                                stripTimeFromDate(billed_month);

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

            myChart?.setOption(option);
        }
    }, [
        billingHistory,
        billingStoreHydrated,
        intl,
        months,
        myChart,
        seriesConfig,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    return (
        <div id="task-hours-by-month" style={{ height: CARD_AREA_HEIGHT }} />
    );
}

export default TaskHoursByMonthGraph;
