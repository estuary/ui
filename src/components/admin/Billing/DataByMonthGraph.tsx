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
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useBilling_billingDetails } from 'stores/Tables/Billing/hooks';

// Grid item height - 72 = graph canvas height

function DataByMonthGraph() {
    const theme = useTheme();

    const billingDetails = useBilling_billingDetails();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!isEmpty(billingDetails)) {
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
                    data: [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sept',
                        'Oct',
                        'Nov',
                        'Dec',
                    ],
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
                },
                series: [
                    {
                        type: 'line',
                        data: [5, 20, 35, 5, 8, 14, 6],
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
                    valueFormatter: (value: any) => `${value} GB`,
                },
                grid: {
                    left: 50,
                    top: 10,
                    right: 50,
                    bottom: 20,
                },
            };

            myChart?.setOption(option);
        }
    }, [setMyChart, billingDetails, myChart, theme]);

    return <div id="data-by-month" style={{ height: 178 }} />;
}

export default DataByMonthGraph;
