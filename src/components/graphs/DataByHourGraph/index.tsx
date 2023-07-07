import { useTheme } from '@mui/material';
import { DetailsStats } from 'api/stats';
import { defaultOutlineColor } from 'context/Theme';
import { eachHourOfInterval, subHours } from 'date-fns';
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

function DataByHourGraph({ range, stats }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const tooltipConfig = useTooltipConfig();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    const hours = useMemo(() => {
        const today = new Date();
        const startDate = subHours(today, range - 1);

        return eachHourOfInterval({
            start: startDate,
            end: today,
        }).map((date) => intl.formatTime(date));
    }, [intl, range]);

    const seriesConfig: EChartsOption['series'] = useMemo(() => {
        const bytesSeries: EChartsOption['series'] = {
            data: [],
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
            data: [],
            name: intl.formatMessage({ id: 'data.docs' }),
            type: 'bar',
            yAxisIndex: 1,
        };

        // if (createdAt) {
        //     const xAxis = intl.formatTime(
        //         formatRFC3339(startOfHour(parseISO(createdAt)))
        //     );
        //     // const xAxis = formatRFC3339(parseISO(createdAt));

        //     bytesSeries.markPoint = {
        //         data: [
        //             {
        //                 name: intl.formatMessage({
        //                     id: 'detailsPanel.recentUsage.createdAt.label',
        //                 }),
        //                 coord: [xAxis, 0],
        //             },
        //         ],
        //         label: {
        //             formatter: () => {
        //                 return intl.formatMessage({
        //                     id: 'detailsPanel.recentUsage.createdAt.label',
        //                 });
        //             },
        //         },
        //         itemStyle: {
        //             color: infoMain,
        //         },
        //     };
        // }

        return [bytesSeries, docsSeries];
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
                        const { 0: time, 1: value } = data;

                        // If the first item add a header
                        if (content.length === 0) {
                            content.push(getTooltipTitle(time));
                        }

                        let valueDisplay: string;
                        if (value === null) {
                            // Handle null so we can message that there is no data to show
                            valueDisplay = intl.formatMessage({
                                id: 'common.missing',
                            });
                        } else if (seriesName === 'Data') {
                            // format the value based on what data is showing
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

                        // Generate the item html and add it to the content to show
                        content.push(
                            getTooltipItem(marker, seriesName, valueDisplay)
                        );
                    });

                    // Join the content to be a single HTML element
                    return content.join('');
                },
            },
            xAxis: [
                {
                    data: hours,
                    type: 'category',
                },
            ],
            yAxis: [
                {
                    alignTicks: true,
                    name: intl.formatMessage({ id: 'data.data' }),
                    type: 'value',
                    position: 'left',
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
        };

        myChart?.setOption(option);
    }, [
        hours,
        intl,
        legendConfig,
        myChart,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    // Update the dataset
    useEffect(() => {
        const bytesSeries: EChartsOption['series'] = {
            data: [],
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
            barMinHeight: 1,
            name: intl.formatMessage({ id: 'data.data' }),
            type: 'bar',
            yAxisIndex: 0,
        };

        const docsSeries: EChartsOption['series'] = {
            barMinHeight: 1,
            data: [],
            name: intl.formatMessage({ id: 'data.docs' }),
            type: 'bar',
            yAxisIndex: 1,
        };

        const scopedDataSet = {};
        stats.forEach((stat) => {
            const formattedTime = intl.formatTime(stat.ts);
            const totalDocs = stat.docs_to
                ? stat.docs_to + stat.docs_by
                : stat.docs_by;
            const totalBytes = stat.bytes_to
                ? stat.bytes_to + stat.bytes_by
                : stat.bytes_by;

            scopedDataSet[formattedTime] = {
                docs: totalDocs,
                bytes: totalBytes,
            };
        });

        hours.forEach((hour) => {
            const hourlyDataSet = scopedDataSet[hour];

            const bytes = hourlyDataSet?.bytes ?? null;
            const docs = hourlyDataSet?.docs ?? null;

            bytesSeries.data?.push([hour, bytes]);
            docsSeries.data?.push([hour, docs]);
        });

        myChart?.setOption({
            series: [bytesSeries, docsSeries],
        });
    }, [hours, intl, myChart, stats]);

    return <div id="data-by-hour" style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByHourGraph;
