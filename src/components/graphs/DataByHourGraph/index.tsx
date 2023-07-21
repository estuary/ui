import { useEffect, useMemo, useState } from 'react';

import { EChartsOption } from 'echarts';
import { CatalogStats_Details } from 'types';
import { eachHourOfInterval, subHours } from 'date-fns';
import prettyBytes from 'pretty-bytes';
import { FormatDateOptions, useIntl } from 'react-intl';
import readable from 'readable-numbers';

import { useTheme } from '@mui/material';

import { defaultOutlineColor, eChartsColors } from 'context/Theme';

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

import { DataByHourRange } from '../types';
import useLegendConfig from '../useLegendConfig';
import useTooltipConfig from '../useTooltipConfig';

interface Props {
    range: DataByHourRange;
    stats: CatalogStats_Details[] | undefined;
    createdAt?: string;
}

const formatTimeSettings: FormatDateOptions = {
    hour: '2-digit',
    minute: '2-digit',
};

const formatDateSettings: FormatDateOptions = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
};

const defaultDataFormat = (value: any) => {
    return prettyBytes(value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

function DataByHourGraph({ range, stats = [] }: Props) {
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

        // Format the full date so that hours from one day don't show for another day
        return listOfHours.map((date) => {
            return intl.formatDate(date, formatDateSettings);
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
        // Want to format with seconds to show more of a "ticking clock" to users
        const currentTime = intl.formatTime(new Date(), {
            ...formatTimeSettings,
            second: '2-digit',
        });

        // Made a string instead of passing value into message to make life easier
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
                        formatter: (value: any) => {
                            // We store the date and time but only want to show time to user
                            return intl.formatTime(value, formatTimeSettings);
                        },
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
                        color: eChartsColors[0],
                        fontSize: 14,
                        fontWeight: 'bold',
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
                        color: eChartsColors[1],
                        fontSize: 14,
                        fontWeight: 'bold',
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
            const formattedTime = intl.formatDate(stat.ts, formatDateSettings);

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
        const bytesFormatter = ({ value }: any) => {
            if (!Number.isInteger(value)) {
                return intl.formatMessage({
                    id: 'common.missing',
                });
            }

            return defaultDataFormat(value);
        };
        const bytesSeries: EChartsOption['series'] = {
            data: [],
            markLine: {
                data: [{ type: 'max', name: 'Max' }],
                label: {
                    position: 'start',
                    formatter: bytesFormatter,
                },
                symbolSize: 0,
            },
            barMinHeight: 1,
            name: intl.formatMessage({ id: 'data.data' }),
            type: 'bar',
            yAxisIndex: 0,
            tooltip: {
                valueFormatter: (value: any) => bytesFormatter({ value }),
            },
        };

        const docsFormatter = ({ value }: any) => {
            if (!Number.isInteger(value)) {
                return intl.formatMessage({
                    id: 'common.missing',
                });
            }

            return readable(value, 2, false);
        };

        const docsSeries: EChartsOption['series'] = {
            barMinHeight: 1,
            data: [],
            markLine: {
                data: [{ type: 'max', name: 'Max' }],
                label: {
                    position: 'end',
                    formatter: docsFormatter,
                },
                symbolSize: 0,
            },
            name: intl.formatMessage({ id: 'data.docs' }),
            type: 'bar',
            yAxisIndex: 1,
            tooltip: {
                valueFormatter: (value: any) => docsFormatter({ value }),
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
