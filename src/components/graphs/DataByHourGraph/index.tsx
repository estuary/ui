import { useTheme } from '@mui/material';
import { DetailsStats } from 'api/stats';
import { eachHourOfInterval, sub } from 'date-fns';
import { EChartsOption } from 'echarts';
import { LineChart, ScatterChart } from 'echarts/charts';
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
import { useUpdateEffect } from 'react-use';
import readable from 'readable-numbers';
import { CARD_AREA_HEIGHT } from 'utils/billing-utils';
import { getTooltipItem, getTooltipTitle } from '../tooltips';
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

    const hours = useMemo(() => {
        const today = new Date();
        const startDate = sub(today, { hours: range - 1 });

        return eachHourOfInterval({
            start: startDate,
            end: today,
        }).map((date) => intl.formatTime(date));
    }, [intl, range]);

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
                showSymbol: false,
                smooth: true,
                type: 'line',
                yAxisIndex: 0,
            },
            {
                encode: { y: 'docs' },
                name: intl.formatMessage({ id: 'data.docs' }),
                showSymbol: false,
                smooth: true,
                type: 'line',
                yAxisIndex: 1,
            },
        ];
    }, [intl]);

    const legendConfig = useLegendConfig(seriesConfig);

    useEffect(() => {
        console.log('Starting up eCharts');

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
                ScatterChart,
            ]);

            const chartDom = document.getElementById('data-by-hour');

            setMyChart(chartDom && echarts.init(chartDom));
        }
    }, [myChart]);

    useUpdateEffect(() => {
        console.log('Adding echarts resizer');

        window.addEventListener('resize', () => {
            myChart?.resize();
        });
    }, [myChart]);

    useEffect(() => {
        console.log('main effect running here');

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
                formatter: (tooltipConfigs: any) => {
                    const content: string[] = [];

                    tooltipConfigs.forEach((config: any) => {
                        const { data, marker, seriesName } = config;
                        const { ts, docs, bytes } = data;

                        // format the value based on what data is showing
                        let valueDisplay: string;
                        if (seriesName === 'Data') {
                            valueDisplay = prettyBytes(bytes, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            });
                        } else {
                            valueDisplay =
                                docs > 0
                                    ? readable(docs, 2, false)
                                    : intl.formatMessage({
                                          id: 'common.none',
                                      });
                        }

                        // If the first item add a header
                        if (content.length === 0) {
                            content.push(getTooltipTitle(ts));
                        }

                        // Generate the item html
                        content.push(
                            getTooltipItem(marker, seriesName, valueDisplay)
                        );
                    });

                    return content.join('');
                },
            },
            xAxis: [
                {
                    axisTick: {
                        alignWithLabel: true,
                    },
                    type: 'category',
                    boundaryGap: false,
                    data: hours,
                },
            ],
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
        hours,
        intl,
        legendConfig,
        myChart,
        seriesConfig,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    // Update the set as we get fresh stats
    const dataSet = useMemo(() => {
        return stats.map((stat) => {
            const totalDocs = stat.docs_to
                ? stat.docs_to + stat.docs_by
                : stat.docs_by;
            const totalBytes = stat.bytes_to
                ? stat.bytes_to + stat.bytes_by
                : stat.bytes_by;

            const ts = intl.formatTime(stat.ts);
            console.log('ts', ts);

            return {
                ts,
                docs: totalDocs,
                bytes: totalBytes,
            };
        });
    }, [stats]);

    // Update the dataset
    useEffect(() => {
        const dataset: EChartsOption['dataset'] = {
            dimensions: ['ts', 'docs', 'bytes'],
            source: dataSet,
        };
        myChart?.setOption({
            dataset,
        });
    }, [dataSet, myChart]);

    return <div id="data-by-hour" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByHourGraph;
