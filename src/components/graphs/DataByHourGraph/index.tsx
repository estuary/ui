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
import { FormatDateOptions, useIntl } from 'react-intl';
import readable from 'readable-numbers';
import { DataByHourRange } from '../types';
import useLegendConfig from '../useLegendConfig';
import useTooltipConfig from '../useTooltipConfig';

interface Props {
    stats: DetailsStats[];
    range: DataByHourRange;
    createdAt?: string;
}

const colors = ['#5470C6', '#91CC75'];
const formatTimeSettings: FormatDateOptions = {
    hour: '2-digit',
    minute: '2-digit',
};

const defaultDataFormat = (value: any) => {
    return prettyBytes(value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

function DataByHourGraph({ range, stats }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const legendConfig = useLegendConfig();
    const tooltipConfig = useTooltipConfig();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // Generate a list of all the hours within the range requested
    const hours = useMemo(() => {
        const today = new Date();
        const startDate = subHours(today, range - 1);
        const listOfHours = eachHourOfInterval({
            start: startDate,
            end: today,
        });

        return listOfHours.map((date) => {
            return intl.formatTime(date, formatTimeSettings);
        });
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
                const chart = echarts.init(chartDom);

                // Save off chart into state
                setMyChart(chart);

                // wire up resizing
                window.addEventListener('resize', () => {
                    chart.resize();
                });
            }
        }
    }, [myChart]);

    // Update the "last updated" string shown as an xAxis label
    useEffect(() => {
        const currentTime = intl.formatTime(new Date(), {
            ...formatTimeSettings,
            second: '2-digit',
        });

        setLastUpdated(
            `${intl.formatMessage({
                id: 'entityTable.data.lastUpdatedWithColon',
            })} ${currentTime}`
        );
    }, [intl, stats]);

    // Set the main bulk of the options for the chart
    useEffect(() => {
        const option: EChartsOption = {
            animation: false,
            darkMode: theme.palette.mode === 'dark',
            legend: legendConfig,
            textStyle: {
                color: theme.palette.text.primary,
            },
            tooltip: tooltipConfig,
            xAxis: [
                {
                    data: hours,
                    axisLabel: {
                        align: 'center',
                    },
                    type: 'category',
                },
                {
                    data: [lastUpdated],
                    axisLabel: {
                        align: 'center',
                    },
                    axisPointer: {
                        show: false,
                    },
                    tooltip: {
                        show: false,
                    },
                    position: 'top',
                    silent: true,
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
                            return defaultDataFormat(value);
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
        lastUpdated,
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
            const formattedTime = intl.formatTime(stat.ts, formatTimeSettings);

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
                    formatter: ({ value }: any) => defaultDataFormat(value),
                },
                symbolSize: 0,
            },
            barMinHeight: 1,
            name: intl.formatMessage({ id: 'data.data' }),
            type: 'bar',
            yAxisIndex: 0,
            tooltip: {
                valueFormatter: (value: any) => {
                    if (!Number.isInteger(value)) {
                        return intl.formatMessage({
                            id: 'common.missing',
                        });
                    }

                    return defaultDataFormat(value);
                },
            },
        };

        const docsSeries: EChartsOption['series'] = {
            barMinHeight: 1,
            data: [],
            name: intl.formatMessage({ id: 'data.docs' }),
            type: 'bar',
            yAxisIndex: 1,
            tooltip: {
                valueFormatter: (value: any) => {
                    if (!Number.isInteger(value)) {
                        return intl.formatMessage({
                            id: 'common.missing',
                        });
                    }

                    return readable(value, 2, false);
                },
            },
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
                itemStyle.opacity = '0.80';
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

    return <div id="data-by-hour" style={{ height: 350 }} />;
}

export default DataByHourGraph;
