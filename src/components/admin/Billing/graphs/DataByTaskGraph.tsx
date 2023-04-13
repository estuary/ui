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
    LegendComponent,
    MarkLineComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import navArrowLeftDark from 'images/graph-icons/nav-arrow-left__dark.svg';
import navArrowLeftLight from 'images/graph-icons/nav-arrow-left__light.svg';
import navArrowRightDark from 'images/graph-icons/nav-arrow-right__dark.svg';
import navArrowRightLight from 'images/graph-icons/nav-arrow-right__light.svg';
import { isEmpty } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_dataByTaskGraphDetails,
    useBilling_hydrated,
} from 'stores/Tables/Billing/hooks';
import { DataVolumeByTaskGraphDetails } from 'stores/Tables/Billing/types';
import useConstant from 'use-constant';
import {
    BYTES_PER_GB,
    CARD_AREA_HEIGHT,
    formatDataVolumeForDisplay,
    SeriesConfig,
} from 'utils/billing-utils';
import { hasLength } from 'utils/misc-utils';

const navArrowsLight = [
    `image://${navArrowLeftLight}`,
    `image://${navArrowRightLight}`,
];

const navArrowsDark = [
    `image://${navArrowLeftDark}`,
    `image://${navArrowRightDark}`,
];

function DataByTaskGraph() {
    const theme = useTheme();
    const intl = useIntl();

    const billingStoreHydrated = useBilling_hydrated();
    const dataByTaskGraphDetails = useBilling_dataByTaskGraphDetails();

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

        let filteredDetails: DataVolumeByTaskGraphDetails = {};

        Object.entries(dataByTaskGraphDetails).forEach(
            ([catalogName, details]) => {
                filteredDetails = {
                    ...filteredDetails,
                    [catalogName]: details.filter(({ date }) =>
                        isWithinInterval(date, {
                            start: startDate,
                            end: today,
                        })
                    ),
                };
            }
        );

        return Object.entries(filteredDetails).map(
            ([seriesName, taskData]) => ({
                seriesName,
                data: taskData.map(({ date, dataVolume }) => [
                    intl.formatDate(date, { month: 'short' }),
                    dataVolume,
                ]),
            })
        );
    }, [dataByTaskGraphDetails, intl, today]);

    useEffect(() => {
        if (billingStoreHydrated && hasLength(seriesConfig)) {
            if (!myChart) {
                echarts.use([
                    GridComponent,
                    LegendComponent,
                    LineChart,
                    CanvasRenderer,
                    UniversalTransition,
                    MarkLineComponent,
                    TooltipComponent,
                ]);

                const chartDom = document.getElementById('data-by-task');

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
                series: seriesConfig.map(({ seriesName, data }, index) => {
                    let config: any = {
                        name: seriesName,
                        type: 'line',
                        data: data.map(([month, dataVolume]) => [
                            month,
                            (dataVolume / BYTES_PER_GB).toFixed(3),
                        ]),
                        symbol: 'circle',
                        symbolSize: 7,
                    };

                    if (index === 0) {
                        config = {
                            ...config,
                            markLine: {
                                data: [{ yAxis: 20, name: 'GB\nFree' }],
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
                        };
                    }

                    return config;
                }),
                legend: {
                    type: 'scroll',
                    data: seriesConfig.map((config) => config.seriesName),
                    textStyle: {
                        color: theme.palette.text.primary,
                        fontWeight: 'normal',
                    },
                    icon: 'circle',
                    itemWidth: 10,
                    itemHeight: 10,
                    pageTextStyle: {
                        color: theme.palette.text.primary,
                    },
                    pageIcons: {
                        horizontal:
                            theme.palette.mode === 'light'
                                ? navArrowsLight
                                : navArrowsDark,
                    },
                },
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
                        let content: string | undefined;

                        tooltipConfigs.forEach((config) => {
                            const dataVolume = formatDataVolumeForDisplay(
                                seriesConfig,
                                config
                            );

                            if (content) {
                                content = `${content}${config.marker} ${dataVolume}<br />`;
                            } else {
                                const tooltipTitle =
                                    dataByTaskGraphDetails[config.seriesName]
                                        .map(({ date }) =>
                                            intl.formatDate(date, {
                                                month: 'short',
                                                year: 'numeric',
                                            })
                                        )
                                        .find((date) =>
                                            date.includes(config.name)
                                        ) ?? config.name;

                                content = `${tooltipTitle}<br />${config.marker} ${dataVolume}<br />`;
                            }
                        });

                        return content;
                    },
                },
                grid: {
                    left: 60,
                    top: 50,
                    right: 50,
                    bottom: 20,
                },
            };

            myChart?.setOption(option);
        }
    }, [
        setMyChart,
        dataByTaskGraphDetails,
        billingStoreHydrated,
        intl,
        months,
        myChart,
        seriesConfig,
        theme,
    ]);

    if (billingStoreHydrated) {
        return isEmpty(dataByTaskGraphDetails) ? (
            <EmptyGraphState />
        ) : (
            <div id="data-by-task" style={{ height: CARD_AREA_HEIGHT }} />
        );
    } else {
        return <GraphLoadingState />;
    }
}

export default DataByTaskGraph;
