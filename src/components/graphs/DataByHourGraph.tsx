import { DefaultStats } from 'api/stats';
import { eachHourOfInterval, sub } from 'date-fns';
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
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import useConstant from 'use-constant';
import { CARD_AREA_HEIGHT, SeriesConfig } from 'utils/billing-utils';
import { DataByHourRange } from './types';

interface Props {
    stats: DefaultStats[];
    range: DataByHourRange;
}

function DataByHourGraph({ range, stats }: Props) {
    const intl = useIntl();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    const today = useConstant(() => new Date());

    const hours = useMemo(() => {
        const startDate = sub(today, { hours: range - 1 });

        return eachHourOfInterval({
            start: startDate,
            end: today,
        }).map((date) => intl.formatTime(date));
    }, [intl, today, range]);

    const seriesConfig = useMemo(() => {
        const scopedDataSet = {};
        stats.forEach((stat) => {
            const formattedTime = intl.formatTime(stat.ts);
            scopedDataSet[formattedTime] = {
                docs: stat.docs_written_by_me,
                bytes: stat.bytes_written_by_me,
            };
        });

        // Create the series config object so we can push to the data prop
        const bytesSeries: SeriesConfig = {
            data: [],
            name: 'Data',
            type: 'line',
            yAxisIndex: 0,
            smooth: true,
            showAllSymbol: true,
            symbol: 'circle',
        };
        const docsSeries: SeriesConfig = {
            data: [],
            name: 'Docs',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            showAllSymbol: true,
            symbol: 'rect',
        };

        // Go through all the hours so we can snag
        hours.forEach((hour) => {
            const hourlyDataSet = scopedDataSet[hour];

            const bytes = hourlyDataSet?.bytes ?? 0;
            const docs = hourlyDataSet?.docs ?? 0;
            bytesSeries.data.push([hour, bytes]);
            docsSeries.data.push([hour, docs]);
        });

        return [bytesSeries, docsSeries];
    }, [intl, hours, stats]);

    console.log('hours', hours);
    console.log('seriesConfig', seriesConfig);

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
            animation: false,
            legend: {
                data: ['Data', 'Docs'],
            },
            xAxis: {
                axisTick: {
                    alignWithLabel: true,
                },
                type: 'category',
                boundaryGap: false,
                data: hours,
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
            series: seriesConfig,
        };

        myChart?.setOption(option);
    }, [hours, myChart, seriesConfig]);

    return <div id="data-by-hour" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByHourGraph;
