import { useTheme } from '@mui/material';
import { defaultOutlineColor, paperBackground } from 'context/Theme';
import { LineChart } from 'echarts/charts';
import {
    GridComponent,
    MarkLineComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useBilling_billingDetails } from 'stores/Tables/Billing/hooks';

// Grid item height - 72 = graph canvas height
const GB_IN_BYTES = 1073741824;

function DataByMonthGraph() {
    const theme = useTheme();
    const intl = useIntl();

    const billingDetails = useBilling_billingDetails();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    useEffect(() => {
        if (billingDetails.length > 0) {
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

            const months = billingDetails.map(({ date }) =>
                intl.formatDate(date, { month: 'short' })
            );

            const dataVolumeByMonth = billingDetails.map(({ dataVolume }) =>
                (dataVolume / GB_IN_BYTES).toFixed(3)
            );

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
                series: [
                    {
                        type: 'line',
                        data: dataVolumeByMonth,
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
                    },
                ],
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

                            return `${tooltipTitle}<br />${config.marker} ${config.value} GB`;
                        } else {
                            return undefined;
                        }
                    },
                    // valueFormatter: (value: any) => `${value} GB`,
                },
                grid: {
                    left: 60,
                    top: 10,
                    right: 50,
                    bottom: 20,
                },
            };

            myChart?.setOption(option);
        }
    }, [setMyChart, billingDetails, myChart, theme]);

    return <div id="data-by-month" style={{ height: 228 }} />;
}

export default DataByMonthGraph;
