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
import {
    BYTES_PER_GB,
    CARD_AREA_HEIGHT,
    formatDataVolumeForDisplay,
    FREE_GB_BY_TIER,
    SeriesConfig,
} from 'utils/billing-utils';

const stackId = 'Data Volume';
const freeBytes = FREE_GB_BY_TIER.PERSONAL * BYTES_PER_GB;

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

        const scopedDataSet: [string, number][] = billingHistory
            .filter(({ date }) =>
                isWithinInterval(date, {
                    start: startDate,
                    end: today,
                })
            )
            .map(({ date, dataVolume }) => [
                intl.formatDate(date, { month: 'short' }),
                dataVolume,
            ]);

        return scopedDataSet
            .map(
                ([month, dataVolume]: [string, number]):
                    | SeriesConfig
                    | SeriesConfig[] => {
                    if (dataVolume > freeBytes) {
                        const byteSurplus = dataVolume - freeBytes;

                        return [
                            {
                                seriesName: 'Included',
                                stack: stackId,
                                data: [[month, freeBytes]],
                            },
                            {
                                seriesName: 'Additional',
                                stack: stackId,
                                data: [[month, byteSurplus]],
                            },
                        ];
                    } else {
                        return [
                            {
                                seriesName: 'Included',
                                stack: stackId,
                                data: [[month, dataVolume]],
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

                const chartDom = document.getElementById('data-by-month');

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
                    axisLabel: {
                        formatter: '{value} GB',
                    },
                    splitLine: {
                        lineStyle: {
                            color: defaultOutlineColor[theme.palette.mode],
                        },
                    },
                    minInterval: 0.001,
                },
                series: seriesConfig.map(({ seriesName, stack, data }) => ({
                    name: seriesName,
                    type: 'bar',
                    stack,
                    emphasis: {
                        focus: 'series',
                    },
                    barMinHeight: seriesName === 'Included' ? 3 : 0,
                    data: data.map(([month, dataVolume]) => [
                        month,
                        (dataVolume / BYTES_PER_GB).toFixed(3),
                    ]),
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
                            const dataVolume = formatDataVolumeForDisplay(
                                seriesConfig,
                                config
                            );

                            if (content) {
                                content = `${content}
                                            <div class="tooltipItem">
                                                <div>
                                                    ${config.marker}
                                                    <span>${config.seriesName}</span>
                                                </div>
                                                <span class="tooltipDataValue">${dataVolume}</span>
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
                                                <span class="tooltipDataValue">${dataVolume}</span>
                                            </div>`;
                            }
                        });

                        return content;
                    },
                },
                grid: {
                    left: 10,
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
        theme,
    ]);

    if (billingStoreHydrated) {
        return billingHistory.length > 0 ? (
            <div id="data-by-month" style={{ height: CARD_AREA_HEIGHT }} />
        ) : (
            <EmptyGraphState />
        );
    } else {
        return <GraphLoadingState />;
    }
}

export default DataByMonthGraph;
