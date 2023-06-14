import { LineChart } from 'echarts/charts';
import {
    GridComponent,
    LegendComponent,
    ToolboxComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useState } from 'react';
import { CARD_AREA_HEIGHT } from 'utils/billing-utils';

interface Props {
    stats: any[];
}

function DataByHourGraph({ stats }: Props) {
    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!myChart) {
            echarts.use([
                ToolboxComponent,
                TooltipComponent,
                GridComponent,
                LegendComponent,
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
            legend: {
                data: ['Data', 'Docs'],
            },
            xAxis: {
                axisTick: {
                    alignWithLabel: true,
                },
                type: 'category',
                boundaryGap: false,
                data: stats.map((stat) => stat.ts),
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Data',
                    alignTicks: true,
                    axisLine: {
                        show: true,
                    },
                    axisLabel: {
                        formatter: '{value} bytes',
                    },
                },
                {
                    type: 'value',
                    name: 'Docs',
                    position: 'right',
                    alignTicks: true,
                    axisLine: {
                        show: true,
                    },
                    axisLabel: {
                        formatter: '{value} docs',
                    },
                },
            ],
            series: [
                {
                    name: 'Data',
                    type: 'line',
                    yAxisIndex: 0,
                    data: stats.map((stat) => stat.bytes_written_by_me),
                },
                {
                    name: 'Docs',
                    type: 'line',
                    yAxisIndex: 1,
                    data: stats.map((stat) => stat.docs_written_by_me),
                },
            ],
        };

        myChart?.setOption(option);
    }, [myChart, stats]);

    return <div id="data-by-hour" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByHourGraph;
