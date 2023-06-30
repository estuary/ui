import { useTheme } from '@mui/material';
import { DetailsStats } from 'api/stats';
import { eachHourOfInterval, sub } from 'date-fns';
import { LineChart } from 'echarts/charts';
import {
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
import useConstant from 'use-constant';
import { CARD_AREA_HEIGHT, SeriesConfig } from 'utils/billing-utils';
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
                docs: stat.docs,
                bytes: stat.bytes,
            };
        });

        // Create the series config object so we can push to the data prop
        const bytesSeries: SeriesConfig = {
            data: [],
            name: 'Data',
            type: 'line',
            yAxisIndex: 0,
            smooth: true,
            markLine: {
                data: [{ type: 'max', name: 'Max' }],
                label: {
                    formatter: ({ value }: any) =>
                        prettyBytes(value, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }),
                },
                position: 'end',
                symbolSize: 0,
            },
        };
        const docsSeries: SeriesConfig = {
            data: [],
            name: 'Docs',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
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

    const legendConfig = useLegendConfig(seriesConfig);

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
                MarkLineComponent,
                MarkPointComponent,
            ]);

            const chartDom = document.getElementById('data-by-hour');

            setMyChart(chartDom && echarts.init(chartDom));
        }

        window.addEventListener('resize', () => {
            myChart?.resize();
        });

        const option = {
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
                formatter: (tooltipConfigs: any[]) => {
                    const content: string[] = [];

                    tooltipConfigs.forEach((config) => {
                        const { axisValueLabel, data, marker, seriesName } =
                            config;
                        const value = data[1];

                        // format the value based on what data is showing
                        let valueDisplay: string;
                        if (seriesName === 'Data') {
                            valueDisplay = prettyBytes(value, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            });
                        } else {
                            valueDisplay =
                                value > 0
                                    ? readable(value, 2, false)
                                    : intl.formatMessage({
                                          id: 'common.none',
                                      });
                        }

                        // If the first item add a header
                        if (content.length === 0) {
                            content.push(getTooltipTitle(axisValueLabel));
                        }

                        // Generate the item html
                        content.push(
                            getTooltipItem(marker, seriesName, valueDisplay)
                        );
                    });

                    return content.join('');
                },
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
                    alignTicks: true,
                    name: 'Data',
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
                    name: 'Docs',
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

    return <div id="data-by-hour" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByHourGraph;
