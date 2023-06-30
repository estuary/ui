import { useTheme } from '@mui/material';
import { DetailsStats } from 'api/stats';
import { subHours } from 'date-fns';
import { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
    DatasetComponent,
    GridComponent,
    LegendComponent,
    MarkLineComponent,
    MarkPointComponent,
    ToolboxComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import prettyBytes from 'pretty-bytes';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import readable from 'readable-numbers';
import { CARD_AREA_HEIGHT } from 'utils/billing-utils';
import { DataByHourRange } from '../types';
import useLegendConfig from '../useLegendConfig';
import useTooltipConfig from '../useTooltipConfig';

interface Props {
    stats: DetailsStats[];
    range: DataByHourRange;
}

const colors = ['#5470C6', '#91CC75'];

function DataByHourGraph({ range, stats }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const tooltipConfig = useTooltipConfig();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    // const today = useConstant(() => new Date());

    // const hours = useMemo(() => {
    //     const startDate = sub(today, { hours: range - 1 });

    //     return eachHourOfInterval({
    //         start: startDate,
    //         end: today,
    //     }).map((date) => intl.formatTime(date));
    // }, [intl, today, range]);

    const dataSet = useMemo(() => {
        return stats.map((stat) => {
            const totalDocs = stat.docs_to
                ? stat.docs_to + stat.docs_by
                : stat.docs_by;
            const totalBytes = stat.bytes_to
                ? stat.bytes_to + stat.bytes_by
                : stat.bytes_by;

            return {
                ts: stat.ts,
                docs: totalDocs,
                bytes: totalBytes,
            };
        });
    }, [stats]);

    const seriesConfig: EChartsOption['series'] = useMemo(() => {
        return [
            {
                encode: { y: 'bytes' },
                markLine: {
                    data: [{ type: 'max', name: 'Max' }],
                    label: {
                        position: 'start',
                        formatter: ({ value }: any) =>
                            prettyBytes(value, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }),
                    },
                    symbolSize: 0,
                },
                name: intl.formatMessage({ id: 'data.data' }),
                smooth: true,
                tooltip: {
                    valueFormatter: (bytes: any) => {
                        return prettyBytes(bytes, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                    },
                },
                type: 'line',
                yAxisIndex: 0,
            },
            {
                encode: { y: 'docs' },
                name: intl.formatMessage({ id: 'data.docs' }),
                smooth: true,
                tooltip: {
                    valueFormatter: (docs: any) => {
                        return docs > 0
                            ? readable(docs, 2, false)
                            : intl.formatMessage({
                                  id: 'common.none',
                              });
                    },
                },
                type: 'line',
                yAxisIndex: 1,
            },
        ];
    }, [intl]);

    const legendConfig = useLegendConfig(seriesConfig);

    useEffect(() => {
        if (!myChart) {
            echarts.use([
                DatasetComponent,
                ToolboxComponent,
                TooltipComponent,
                GridComponent,
                LegendComponent,
                LineChart,
                CanvasRenderer,
                UniversalTransition,
                MarkLineComponent,
                MarkPointComponent,
            ]);

            const chartDom = document.getElementById('data-by-hour');

            setMyChart(chartDom && echarts.init(chartDom));
        }

        window.addEventListener('resize', () => {
            myChart?.resize();
        });

        const option: EChartsOption = {
            animation: false,
            darkMode: theme.palette.mode === 'dark',
            legend: legendConfig,
            textStyle: {
                color: theme.palette.text.primary,
            },
            tooltip: {
                ...tooltipConfig,
                axisPointer: {
                    snap: true,
                    type: 'line',
                    lineStyle: {
                        shadowBlur: 5,
                    },
                },
            },
            xAxis: {
                axisLabel: {
                    formatter: (value: any) => {
                        return intl.formatTime(value);
                    },
                },
                type: 'time',
                min: (value: any) => {
                    return subHours(value.max, range);
                },
                maxInterval: 3600 * 1000 * 1,
            },
            yAxis: [
                {
                    alignTicks: true,
                    name: intl.formatMessage({ id: 'data.data' }),
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: colors[0],
                        },
                    },
                    axisLabel: {
                        color: colors[0],
                        formatter: (value: any) => {
                            return prettyBytes(value);
                        },
                    },
                },
                {
                    alignTicks: true,
                    minInterval: 1,
                    name: intl.formatMessage({ id: 'data.docs' }),
                    position: 'right',
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: colors[1],
                        },
                    },
                    axisLabel: {
                        color: colors[1],
                        formatter: (value: any) => {
                            return readable(value, 1, true);
                        },
                    },
                },
            ],
            series: seriesConfig,
        };

        myChart?.setOption(option);
    }, [
        intl,
        legendConfig,
        myChart,
        range,
        seriesConfig,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    useEffect(() => {
        myChart?.setOption({
            dataset: {
                dimensions: [{ name: 'ts', type: 'time' }, 'docs', 'bytes'],
                source: dataSet,
            },
        });
    }, [dataSet, myChart]);

    return <div id="data-by-hour" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByHourGraph;
