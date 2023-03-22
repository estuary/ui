import { useTheme } from '@mui/material';
import { LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { useBilling_billingDetails } from 'stores/Tables/Billing/hooks';

// Grid item height - 72 = graph canvas height

function DataByMonthGraph() {
    const theme = useTheme();

    const billingDetails = useBilling_billingDetails();

    useEffect(() => {
        if (!isEmpty(billingDetails)) {
            echarts.use([
                GridComponent,
                LineChart,
                CanvasRenderer,
                UniversalTransition,
                MarkLineComponent,
            ]);

            const chartDom = document.getElementById('data-by-month');
            const myChart = chartDom && echarts.init(chartDom);

            window.addEventListener('resize', () => {
                myChart?.resize();
            });

            const option = {
                xAxis: {
                    type: 'category',
                    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        type: 'line',
                        data: [1, 20, 35, 5, 8, 14, 6],
                        markLine: {
                            data: [{ yAxis: 20, name: 'GB Free' }],
                        },
                        lineStyle: {
                            color: theme.palette.primary.main,
                        },
                    },
                ],
                grid: {
                    left: 40,
                    top: 10,
                    right: 20,
                    bottom: 20,
                },
            };

            myChart?.setOption(option);
        }
    }, [billingDetails]);

    return <div id="data-by-month" style={{ height: 178 }} />;
}

export default DataByMonthGraph;
