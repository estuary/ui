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
import { LineChart } from 'echarts/charts';
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
} from 'stores/Tables/Billing/hooks';
import useConstant from 'use-constant';
import { CARD_AREA_HEIGHT, SeriesConfig } from 'utils/billing-utils';

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

        return [
            {
                data: billingHistory
                    .filter(({ date }) =>
                        isWithinInterval(date, {
                            start: startDate,
                            end: today,
                        })
                    )
                    .map(({ date, taskCount }) => [
                        intl.formatDate(date, { month: 'short' }),
                        taskCount,
                    ]),
            },
        ];
    }, [billingHistory, intl, today]);

    useEffect(() => {
        if (billingStoreHydrated && billingHistory.length > 0) {
            if (!myChart) {
                echarts.use([
                    GridComponent,
                    LineChart,
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
                series: seriesConfig.map(({ data }) => ({
                    type: 'line',
                    data,
                    markLine: {
                        data: [{ yAxis: 2, name: 'Tasks\nFree' }],
                        label: {
                            color: theme.palette.text.primary,
                            formatter: '{c} {b}',
                            position: 'end',
                        },
                        lineStyle: {
                            color: theme.palette.text.primary,
                        },
                        silent: true,
                        symbol: 'none',
                    },
                    symbol: 'circle',
                    symbolSize: 7,
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
                    formatter: (tooltipConfigs: any[]) => {
                        if (tooltipConfigs.length > 0) {
                            const config = tooltipConfigs[0];

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

                            return `${tooltipTitle}<br />${config.marker} ${config.value[1]} Tasks`;
                        } else {
                            return undefined;
                        }
                    },
                },
                grid: {
                    left: 50,
                    top: 15,
                    right: 50,
                    bottom: 20,
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
