import { useTheme } from '@mui/material';
import { DetailsStats } from 'api/stats';
import { defaultOutlineColor, infoMain } from 'context/Theme';
import { formatRFC3339, parseISO, startOfHour, subHours } from 'date-fns';
import { EChartsOption } from 'echarts';
import { BarChart, LineChart } from 'echarts/charts';
import {
    DatasetComponent,
    GridComponent,
    LegendComponent,
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
    createdAt?: string;
}

const colors = ['#5470C6', '#91CC75'];

function DataByHourGraph({ createdAt, range, stats }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const tooltipConfig = useTooltipConfig();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    const seriesConfig: EChartsOption['series'] = useMemo(() => {
        const bytesSeries: EChartsOption['series'] = {
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
            barMinHeight: 10,
            name: intl.formatMessage({ id: 'data.data' }),
            type: 'bar',
            yAxisIndex: 0,
        };

        const docsSeries: EChartsOption['series'] = {
            barMinHeight: 10,
            encode: { y: 'docs' },
            name: intl.formatMessage({ id: 'data.docs' }),
            type: 'bar',
            yAxisIndex: 1,
        };

        if (createdAt) {
            const xAxis = formatRFC3339(startOfHour(parseISO(createdAt)));
            // const xAxis = formatRFC3339(parseISO(createdAt));

            bytesSeries.markPoint = {
                data: [
                    {
                        name: intl.formatMessage({
                            id: 'detailsPanel.recentUsage.createdAt.label',
                        }),
                        coord: [xAxis, 0],
                    },
                ],
                itemStyle: {
                    color: infoMain,
                },
                symbol: 'pin',
                symbolSize: 10,
            };
        }

        return [bytesSeries, docsSeries];
    }, [createdAt, intl]);

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
                BarChart,
                CanvasRenderer,
                UniversalTransition,
                MarkPointComponent,
            ]);

            const chartDom = document.getElementById('data-by-hour');

            setMyChart(chartDom && echarts.init(chartDom));
        }
    }, [myChart]);

    useUpdateEffect(() => {
        window.addEventListener('resize', () => {
            myChart?.resize();
        });
    }, [myChart]);

    useEffect(() => {
        const option: EChartsOption = {
            animation: false,
            darkMode: theme.palette.mode === 'dark',
            legend: legendConfig,
            textStyle: {
                color: theme.palette.text.primary,
            },
            tooltip: {
                ...tooltipConfig,
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
                            content.push(getTooltipTitle(intl.formatTime(ts)));
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
                    axisLabel: {
                        formatter: (value: any) => {
                            return intl.formatTime(value);
                        },
                    },
                    min: subHours(new Date(), range),
                    max: new Date(),
                    type: 'time',
                },
            ],
            yAxis: [
                {
                    alignTicks: true,
                    name: intl.formatMessage({ id: 'data.data' }),
                    type: 'value',
                    axisLabel: {
                        color: colors[0],
                        formatter: (value: any) => {
                            return prettyBytes(value);
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            color: defaultOutlineColor[theme.palette.mode],
                        },
                    },
                },
                {
                    alignTicks: true,
                    minInterval: 1,
                    name: intl.formatMessage({ id: 'data.docs' }),
                    position: 'right',
                    type: 'value',
                    axisLabel: {
                        color: colors[1],
                        formatter: (value: any) => {
                            return readable(value, 1, true);
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            color: defaultOutlineColor[theme.palette.mode],
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

    // Update the set as we get fresh stats
    const dataSet = useMemo(() => {
        return stats.map((stat) => {
            const totalDocs = stat.docs_to
                ? stat.docs_to + stat.docs_by
                : stat.docs_by;
            const totalBytes = stat.bytes_to
                ? stat.bytes_to + stat.bytes_by
                : stat.bytes_by;

            const ts = new Date(stat.ts);
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
            dimensions: [{ name: 'ts', type: 'time' }, 'docs', 'bytes'],
            source: dataSet,
        };
        myChart?.setOption({
            dataset,
        });
    }, [dataSet, myChart]);

    return <div id="data-by-hour" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByHourGraph;
