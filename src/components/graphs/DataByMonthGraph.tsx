import { useEffect, useMemo, useState } from 'react';

import {
    eachMonthOfInterval,
    isWithinInterval,
    startOfMonth,
    sub,
} from 'date-fns';
import { useIntl } from 'react-intl';
import useConstant from 'use-constant';

import { useTheme } from '@mui/material';

import { defaultOutlineColor } from 'context/Theme';

import {
    useBilling_billingHistory,
    useBilling_hydrated,
} from 'stores/Billing/hooks';

import {
    CARD_AREA_HEIGHT,
    formatDataVolumeForDisplay,
    SeriesConfig,
    SeriesNames,
    stripTimeFromDate,
} from 'utils/billing-utils';

import { BarChart } from 'echarts/charts';
import {
    GridComponent,
    MarkLineComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import { getTooltipItem, getTooltipTitle } from './tooltips';
import useTooltipConfig from './useTooltipConfig';

const stackId = 'Data Volume';

function DataByMonthGraph() {
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

        const scopedDataSet: {
            month: string;
            includedDataVolume: number;
            surplusDataVolume: number;
        }[] = billingHistory
            .filter(({ billed_month }) => {
                const billedMonth = stripTimeFromDate(billed_month);

                return isWithinInterval(billedMonth, {
                    start: startDate,
                    end: today,
                });
            })
            .map(({ billed_month, line_items }) => {
                const billedMonth = stripTimeFromDate(billed_month);

                return {
                    month: intl.formatDate(billedMonth, { month: 'short' }),
                    includedDataVolume: line_items[2].count,
                    surplusDataVolume: line_items[3].count,
                };
            });

        return scopedDataSet.flatMap(
            ({
                month,
                includedDataVolume,
                surplusDataVolume,
            }): SeriesConfig | SeriesConfig[] => [
                {
                    seriesName: SeriesNames.INCLUDED,
                    stack: stackId,
                    data: [[month, includedDataVolume]],
                },
                {
                    seriesName: SeriesNames.SURPLUS,
                    stack: stackId,
                    data: [[month, surplusDataVolume]],
                },
            ]
        );
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
                    barMinHeight: seriesName === SeriesNames.INCLUDED ? 3 : 0,
                    data: data.map(([month, dataVolume]) => [
                        month,
                        dataVolume.toFixed(3),
                    ]),
                })),
                textStyle: {
                    color: theme.palette.text.primary,
                },
                tooltip: {
                    ...tooltipConfig,
                    formatter: (tooltipConfigs: any[]) => {
                        let content: string | undefined;

                        tooltipConfigs.forEach((config) => {
                            const dataVolume = formatDataVolumeForDisplay(
                                seriesConfig,
                                config
                            );

                            const tooltipItem = getTooltipItem(
                                config.marker,
                                config.seriesName,
                                dataVolume
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

    return <div id="data-by-month" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByMonthGraph;
