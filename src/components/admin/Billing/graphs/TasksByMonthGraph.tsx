import { useTheme } from '@mui/material';
import EmptyGraphState from 'components/admin/Billing/graphs/states/Empty';
import GraphLoadingState from 'components/admin/Billing/graphs/states/Loading';
import { defaultOutlineColor, paperBackground } from 'context/Theme';
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
import { CARD_AREA_HEIGHT, SeriesConfig } from 'utils/billing-utils';

const stackId = 'Task Count';

function DataByMonthGraph() {
    const theme = useTheme();
    const intl = useIntl();

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

        const scopedDataSet: {
            month: string;
            taskCount: number;
            includedTasks: number | null;
        }[] = billingHistory
            .filter(({ date }) =>
                isWithinInterval(date, {
                    start: startDate,
                    end: today,
                })
            )
            .map(({ date, taskCount, includedTasks }) => ({
                month: intl.formatDate(date, { month: 'short' }),
                taskCount,
                includedTasks,
            }));

        return scopedDataSet
            .map(
                ({
                    month,
                    taskCount,
                    includedTasks,
                }): SeriesConfig | SeriesConfig[] => {
                    const freeTasks = includedTasks ?? 2;

                    if (taskCount > freeTasks) {
                        const taskSurplus = taskCount - freeTasks;

                        return [
                            {
                                seriesName: 'Included',
                                stack: stackId,
                                data: [[month, freeTasks]],
                            },
                            {
                                seriesName: 'Additional',
                                stack: stackId,
                                data: [[month, taskSurplus]],
                            },
                        ];
                    } else {
                        return [
                            {
                                seriesName: 'Included',
                                stack: stackId,
                                data: [[month, taskCount]],
                            },
                            {
                                seriesName: 'Additional',
                                stack: stackId,
                                data: [[month, 0]],
                            },
                        ];
                    }
                }
            )
            .flat();
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

                const chartDom = document.getElementById('tasks-by-month');

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
                series: seriesConfig.map(({ seriesName, stack, data }) => ({
                    name: seriesName,
                    type: 'bar',
                    stack,
                    data,
                    emphasis: {
                        focus: 'series',
                    },
                })),
                textStyle: {
                    color: theme.palette.text.primary,
                },
                tooltip: {
                    backgroundColor: paperBackground[theme.palette.mode],
                    borderColor: defaultOutlineColor[theme.palette.mode],
                    trigger: 'axis',
                    textStyle: {
                        color: theme.palette.text.primary,
                        fontWeight: 'normal',
                    },
                    axisPointer: {
                        type: 'shadow',
                    },
                    formatter: (tooltipConfigs: any[]) => {
                        let content: string | undefined;

                        tooltipConfigs.forEach((config) => {
                            const taskCount = config.value[1];
                            const formattedValue =
                                taskCount === 1
                                    ? `${taskCount} Task`
                                    : `${taskCount} Tasks`;

                            if (content) {
                                content = `${content}
                                            <div class="tooltipItem">
                                                <div>
                                                    ${config.marker}
                                                    <span>${config.seriesName}</span>
                                                </div>
                                                <span class="tooltipDataValue">${formattedValue}</span>
                                            </div>`;
                            } else {
                                const tooltipTitle =
                                    billingHistory
                                        .map(({ date }) =>
                                            intl.formatDate(date, {
                                                month: 'short',
                                                year: 'numeric',
                                            })
                                        )
                                        .find((date) =>
                                            date.includes(config.axisValueLabel)
                                        ) ?? config.axisValueLabel;

                                content = `<div class="tooltipTitle">${tooltipTitle}</div>
                                            <div class="tooltipItem">
                                                <div>
                                                    ${config.marker}
                                                    <span>${config.seriesName}</span>
                                                </div>
                                                <span class="tooltipDataValue">${formattedValue}</span>
                                            </div>`;
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
        setMyChart,
        billingHistory,
        billingStoreHydrated,
        intl,
        months,
        myChart,
        seriesConfig,
        theme.palette.mode,
        theme.palette.text.primary,
    ]);

    if (billingStoreHydrated) {
        return billingHistory.length > 0 ? (
            <div id="tasks-by-month" style={{ height: CARD_AREA_HEIGHT }} />
        ) : (
            <EmptyGraphState />
        );
    } else {
        return <GraphLoadingState />;
    }
}

export default DataByMonthGraph;
