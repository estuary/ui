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
    useBilling_billingDetails,
    useBilling_hydrated,
} from 'stores/Tables/Billing/hooks';
import useConstant from 'use-constant';
import {
    BYTES_PER_GB,
    CARD_AREA_HEIGHT,
    formatDataVolumeForDisplay,
    SeriesConfig,
} from 'utils/billing-utils';

function DataByMonthGraph() {
    const theme = useTheme();
    const intl = useIntl();

    const billingStoreHydrated = useBilling_hydrated();
    const billingDetails = useBilling_billingDetails();

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
                data: billingDetails
                    .filter(({ date }) =>
                        isWithinInterval(date, {
                            start: startDate,
                            end: today,
                        })
                    )
                    .map(({ date, dataVolume }) => [
                        intl.formatDate(date, { month: 'short' }),
                        dataVolume,
                    ]),
            },
        ];
    }, [billingDetails, intl, today]);

    useEffect(() => {
        if (billingStoreHydrated && billingDetails.length > 0) {
            if (!myChart) {
                echarts.use([
                    GridComponent,
                    LineChart,
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
                series: seriesConfig.map(({ data }) => ({
                    type: 'line',
                    data: data.map(([month, dataVolume]) => [
                        month,
                        (dataVolume / BYTES_PER_GB).toFixed(3),
                    ]),
                    markLine: {
                        data: [{ yAxis: 10, name: 'GB\nFree' }],
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

                            const dataVolume = formatDataVolumeForDisplay(
                                seriesConfig,
                                config
                            );

                            const tooltipTitle =
                                billingDetails
                                    .map(({ date }) =>
                                        intl.formatDate(date, {
                                            month: 'short',
                                            year: 'numeric',
                                        })
                                    )
                                    .find((date) =>
                                        date.includes(config.axisValueLabel)
                                    ) ?? config.axisValueLabel;

                            return `${tooltipTitle}<br />${config.marker} ${dataVolume}`;
                        } else {
                            return undefined;
                        }
                    },
                },
                grid: {
                    left: 60,
                    top: 15,
                    right: 50,
                    bottom: 20,
                },
            };

            myChart?.setOption(option);
        }
    }, [
        setMyChart,
        billingDetails,
        billingStoreHydrated,
        intl,
        months,
        myChart,
        seriesConfig,
        theme,
    ]);

    if (billingStoreHydrated) {
        return billingDetails.length > 0 ? (
            <div id="data-by-month" style={{ height: CARD_AREA_HEIGHT }} />
        ) : (
            <EmptyGraphState />
        );
    } else {
        return <GraphLoadingState />;
    }
}

export default DataByMonthGraph;
