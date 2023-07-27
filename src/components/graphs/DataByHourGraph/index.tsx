import { useTheme } from '@mui/material';
import { defaultOutlineColor, eChartsColors } from 'context/Theme';
import { format, parseISO } from 'date-fns';
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
import { CatalogStats_Details } from 'types';
import { getTooltipItem, getTooltipTitle } from '../tooltips';
import { DataByHourRange } from '../types';
import useLegendConfig from '../useLegendConfig';
import useTooltipConfig from '../useTooltipConfig';

interface Props {
    range: DataByHourRange;
    stats: CatalogStats_Details[] | undefined;
    createdAt?: string;
}

interface Data {
    docs?: number;
    bytes?: number;
    timestamp?: string; //Date;
}

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

function DataByHourGraph({ range, stats = [] }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const legendConfig = useLegendConfig();
    const tooltipConfig = useTooltipConfig();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

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

    // Create a dataset
    const scopedDataSet = useMemo(() => {
        const response: Data[] = stats.map((stat) => {
            // Total up docs. Mainly for collections that are derivations
            //  eventually we might split this data up into multiple lines
            const totalDocs = stat.docs_to
                ? stat.docs_to + stat.docs_by
                : stat.docs_by;
            const totalBytes = stat.bytes_to
                ? stat.bytes_to + stat.bytes_by
                : stat.bytes_by;

            return {
                docs: totalDocs,
                bytes: totalBytes,
                timestamp: stat.ts,
            };
        });

        return response;
    }, [stats]);

    // Set the main bulk of the options for the chart
    useEffect(() => {
        // Function to format that handles both dimensions. This allows the tooltip
        //  formatter to not worry about dimensions and just pass them in here
        const formatter = (value: any, dimension: 'bytes' | 'docs') => {
            if (!Number.isInteger(value)) {
                return intl.formatMessage({
                    id: 'common.missing',
                });
            }

            if (dimension === 'docs') {
                return readable(value, 2, false);
            }

            return defaultDataFormat(value);
        };

        const bytesSeries: EChartsOption['series'] = {
            barMinHeight: 1,
            encode: {
                x: 'timestamp',
                y: 'bytes',
            },
            markLine: {
                data: [{ type: 'max', name: 'Max' }],
                label: {
                    position: 'start',
                    formatter: ({ value }: any) => {
                        return formatter(value, 'bytes');
                    },
                },
                symbolSize: 0,
            },
            name: intl.formatMessage({ id: 'data.data' }),
            type: 'bar',
            yAxisIndex: 0,
        };

        const docsSeries: EChartsOption['series'] = {
            barMinHeight: 1,
            encode: {
                x: 'timestamp',
                y: 'docs',
            },
            markLine: {
                data: [{ type: 'max', name: 'Max' }],
                label: {
                    position: 'end',
                    formatter: ({ value }: any) => {
                        return formatter(value, 'docs');
                    },
                },
                symbolSize: 0,
            },
            name: intl.formatMessage({ id: 'data.docs' }),
            type: 'bar',
            yAxisIndex: 1,
        };

        // TODO (typing) EChartsOption is the type but removed due to it complaining about the dataset typing
        const option: any = {
            animation: false,
            darkMode: theme.palette.mode === 'dark',
            legend: legendConfig,
            series: [bytesSeries, docsSeries],
            useUTC: true,
            // Setting dataset here because setting in a stand alone set option cause the chart to go blank
            dataset: {
                dimensions: ['timestamp', 'bytes', 'docs'],
                source: scopedDataSet,
            },
            textStyle: {
                color: theme.palette.text.primary,
            },
            tooltip: {
                ...tooltipConfig,
                formatter: (tooltipConfigs: any) => {
                    const content: string[] = [];

                    // Add the header outside the loop as we are good just grabbing the first tooltip config
                    const { axisValue } = tooltipConfigs[0];
                    const tooltipTitle = format(
                        parseISO(axisValue),
                        `P hh:mm aa`
                    );
                    content.push(`${getTooltipTitle(tooltipTitle)}`);

                    // Go through all the tooltip configs. These should match to all the Y axis
                    tooltipConfigs.forEach(
                        ({
                            data,
                            dimensionNames,
                            encode,
                            marker,
                            seriesName,
                        }: any) => {
                            // We encode a single prop for the Y axis so should be safe brading that from the dimensions
                            const dimension = dimensionNames[encode.y];

                            // Pass the proper data to the formatter with the dimension to know which formatter to use
                            const displayValue = formatter(
                                data[dimension],
                                dimension
                            );

                            content.push(
                                getTooltipItem(marker, seriesName, displayValue)
                            );
                        }
                    );

                    return content.join('');
                },
            },
            xAxis: [
                {
                    axisLabel: {
                        align: 'center',
                        formatter: (value: any) => {
                            if (value) {
                                return format(parseISO(value), `hh:mm aa`);
                            }
                            return '';
                        },
                    },
                    axisPointer: {
                        show: true,
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
        intl,
        lastUpdated,
        legendConfig,
        myChart,
        range,
        scopedDataSet,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    return <div id="data-by-hour" style={{ height: 350 }} />;
}

export default DataByHourGraph;
