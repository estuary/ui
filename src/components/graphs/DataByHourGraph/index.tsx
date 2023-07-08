import { useTheme } from '@mui/material';
import { DetailsStats } from 'api/stats';
import { defaultOutlineColor } from 'context/Theme';
import { eachHourOfInterval, subHours } from 'date-fns';
import { EChartsOption } from 'echarts';
import { BarChart } from 'echarts/charts';
import {
    DatasetComponent,
    GridComponent,
    LegendComponent,
    MarkLineComponent,
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
    const legendConfig = useLegendConfig();
    const tooltipConfig = useTooltipConfig();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    // Generate a list of all the hours within the range requested
    const hours = useMemo(() => {
        const today = new Date();
        const startDate = subHours(today, range - 1);

        return eachHourOfInterval({
            start: startDate,
            end: today,
        }).map((date) => intl.formatTime(date));
    }, [intl, range]);

    // Wire up the myCharts and pass in components we will use
    useEffect(() => {
        if (!myChart) {
            echarts.use([
                DatasetComponent,
                TooltipComponent,
                GridComponent,
                LegendComponent,
                BarChart,
                CanvasRenderer,
                UniversalTransition,
                MarkLineComponent,
            ]);

            const chartDom = document.getElementById('data-by-hour');

            if (chartDom) {
                setMyChart(echarts.init(chartDom));
            }
        }
    }, [myChart]);

    // Add the window resizer
    useUpdateEffect(() => {
        window.addEventListener('resize', () => {
            myChart?.resize();
        });
    }, [myChart]);

    // Set the main bulk of the options for the chart
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

                    // Run through all the configs to generate all the lines needed
                    tooltipConfigs.forEach((config: any) => {
                        // Grab details we need to display stuff
                        const { axisValue, data, marker, seriesName } = config;
                        const { value } = data;

                        // If the first item add a header
                        if (content.length === 0) {
                            content.push(getTooltipTitle(axisValue));
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

    // Create a dataset the groups things based on time
    const scopedDataSet = useMemo(() => {
        const response = {};

        stats.forEach((stat) => {
            // Format to time
            const formattedTime = intl.formatTime(stat.ts);

            // Total up docs. Mainly for collections that are derivations
            //  eventually we might split this data up into multiple lines
            const totalDocs = stat.docs_to
                ? stat.docs_to + stat.docs_by
                : stat.docs_by;
            const totalBytes = stat.bytes_to
                ? stat.bytes_to + stat.bytes_by
                : stat.bytes_by;

            response[formattedTime] = {
                docs: totalDocs,
                bytes: totalBytes,
            };
        });

        return response;
    }, [intl, stats]);

    // Effect to update the data by updating the series.
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

        // Go through hours so we have data for each hour
        hours.forEach((hour, index) => {
            // See if there is data for the hour we're looking for
            const hourlyDataSet = scopedDataSet[hour];

            // Default to null so we can differentiate between 0 and missing data
            const bytes = hourlyDataSet?.bytes ?? null;
            const docs = hourlyDataSet?.docs ?? null;

            // Add custom styling for the last hour as that will be updating dynamically
            const itemStyle: any = {};
            if (index === hours.length - 1) {
                itemStyle.opacity = '0.8';
            }

            // Add data to series
            bytesSeries.data?.push({ itemStyle, value: bytes });
            docsSeries.data?.push({ itemStyle, value: docs });
        });

        // Update mychart series so new data goes in
        myChart?.setOption({
            series: [bytesSeries, docsSeries],
        });
    }, [hours, intl, myChart, scopedDataSet]);

    return <div id="data-by-hour" style={{ height: 500 }} />;
}

export default DataByHourGraph;
