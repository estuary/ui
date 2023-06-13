import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useState } from 'react';
import { CARD_AREA_HEIGHT } from 'utils/billing-utils';

function DataByHourGraph() {
    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!myChart) {
            echarts.use([
                GridComponent,
                LineChart,
                CanvasRenderer,
                UniversalTransition,
            ]);

            const chartDom = document.getElementById('data-by-hour');

            setMyChart(chartDom && echarts.init(chartDom));
        }

        window.addEventListener('resize', () => {
            myChart?.resize();
        });

        const option = {
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: [1, 2, 3, 4, 5],
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    data: [820, 932, 901, 934, 1290, 1330, 1320],
                    type: 'line',
                    areaStyle: {},
                },
            ],
        };

        myChart?.setOption(option);
    }, [myChart]);

    return <div id="data-by-hour" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByHourGraph;
