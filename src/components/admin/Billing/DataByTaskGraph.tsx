import { useTheme } from '@mui/material';
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
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_billingDetails,
    useBilling_dataByTaskGraphDetails,
} from 'stores/Tables/Billing/hooks';
import { DataVolumeByTaskGraphDetails } from 'stores/Tables/Billing/types';
import { hasLength } from 'utils/misc-utils';

import navArrowLeftDark from 'images/graph-icons/nav-arrow-left__dark.svg';
import navArrowLeftLight from 'images/graph-icons/nav-arrow-left__light.svg';
import navArrowRightDark from 'images/graph-icons/nav-arrow-right__dark.svg';
import navArrowRightLight from 'images/graph-icons/nav-arrow-right__light.svg';

// Grid item height - 72 = graph canvas height
const BYTES_PER_GB = 1073741824;

const today = new Date();

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

    const billingDetails = useBilling_billingDetails();
    const dataByTaskGraphDetails = useBilling_dataByTaskGraphDetails();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    const months = useMemo(() => {
        const startDate = sub(today, { months: 5 });

        return eachMonthOfInterval({
            start: startDate,
            end: today,
        }).map((date) => intl.formatDate(date, { month: 'short' }));
    }, [today]);

    const seriesConfig: { catalogName: string; data: string[][] }[] =
        useMemo(() => {
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
                ([catalogName, taskData]) => ({
                    catalogName,
                    data: taskData.map(({ date, dataVolume }) => [
                        intl.formatDate(date, { month: 'short' }),
                        (dataVolume / BYTES_PER_GB).toFixed(3),
                    ]),
                })
            );
        }, [dataByTaskGraphDetails, months]);

    useEffect(() => {
        if (hasLength(seriesConfig)) {
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
                series: seriesConfig.map(({ catalogName, data }) => ({
                    name: catalogName,
                    type: 'line',
                    data,
                    markLine: {
                        data: [{ yAxis: 20, name: 'GB Free' }],
                        label: {
                            color: theme.palette.text.primary,
                            formatter: '{b}',
                            position: 'end',
                        },
                        lineStyle: {
                            color: theme.palette.text.primary,
                        },
                        symbol: 'none',
                    },
                    symbol: 'circle',
                    symbolSize: 7,
                })),
                legend: {
                    type: 'scroll',
                    data: seriesConfig.map((config) => config.catalogName),
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
                            if (content) {
                                content = `${content}${config.marker} ${config.value[1]} GB<br />`;
                            } else {
                                const tooltipTitle =
                                    billingDetails
                                        .map(({ date }) =>
                                            intl.formatDate(date, {
                                                month: 'short',
                                                year: 'numeric',
                                            })
                                        )
                                        .find((date) =>
                                            date.includes(config.name)
                                        ) ?? config.name;

                                content = `${tooltipTitle}<br />${config.marker} ${config.value[1]} GB<br />`;
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
    }, [setMyChart, billingDetails, months, myChart, seriesConfig, theme]);

    return <div id="data-by-task" style={{ height: 228 }} />;
}

export default DataByTaskGraph;
