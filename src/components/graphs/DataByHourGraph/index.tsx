import { useTheme } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormatDateOptions, useIntl } from 'react-intl';
import readable from 'readable-numbers';
import { CatalogStats_Details } from 'types';
import { getTooltipItem, getTooltipTitle } from '../tooltips';
import { DataByHourRange } from '../types';
import useLegendConfig from '../useLegendConfig';
import useTooltipConfig from '../useTooltipConfig';

interface Props {
    id: string;
    range: DataByHourRange;
    stats: CatalogStats_Details[] | undefined;
    createdAt?: string;
}

// These are keys that are used all over. Not typing them as Echarts typing within
//  dataset complained when I tried
const TIME = 'timestamp';
const DOCS_READ = 'docs_read';
const DOCS_WRITTEN = 'docs_written';
const BYTES_READ = 'bytes_read';
const BYTES_WRITTEN = 'bytes_written';

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

function DataByHourGraph({ id, range, stats = [] }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const legendConfig = useLegendConfig();
    const tooltipConfig = useTooltipConfig();
    const entityType = useEntityType();

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

            const chartDom = document.getElementById(id);

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
    }, [id, myChart]);

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

    // It kind of sucks to be checking the entityType and not just seeing what was returned
    //  However, this prevents us from having to look through ALL the stats to decide what
    //      data to display.
    // Any typing because echarts does not like multiple
    const scopedDataSet = useMemo<any>(() => {
        if (entityType === 'collection') {
            return stats.map((stat) => {
                return {
                    [DOCS_READ]: stat.docs_read,
                    [DOCS_WRITTEN]: stat.docs_written,
                    [BYTES_READ]: stat.bytes_read,
                    [BYTES_WRITTEN]: stat.bytes_written,
                    [TIME]: stat.ts,
                };
            });
        }

        if (entityType === 'capture') {
            return stats.map((stat) => {
                return {
                    [DOCS_WRITTEN]: stat.docs_written,
                    [BYTES_WRITTEN]: stat.bytes_written,
                    [TIME]: stat.ts,
                };
            });
        }

        return stats.map((stat) => {
            return {
                [DOCS_READ]: stat.docs_read,
                [BYTES_READ]: stat.bytes_read,
                [TIME]: stat.ts,
            };
        });
    }, [entityType, stats]);

    // Function to format that handles both dimensions. This allows the tooltip
    //  formatter to not worry about dimensions and just pass them in here
    const formatter = useCallback(
        (
            value: any,
            dimension: 'bytes' | 'docs',
            direction?: 'to' | 'from'
        ) => {
            if (!Number.isInteger(value)) {
                return intl.formatMessage({
                    id: 'common.missing',
                });
            }

            let response = '';
            if (dimension === 'docs') {
                response = `${readable(value, 2, false)}`;
            } else {
                response = `${defaultDataFormat(value)}`;
            }

            if (direction) {
                return `${response} ${direction}`;
            }
            return response;
        },
        [intl]
    );

    // TODO (Typing) EChartsOption['series']
    const [
        bytesReadSeries,
        bytesWrittenSeries,
        docsReadSeries,
        docsWrittenSeries,
    ] = useMemo<any[]>(() => {
        const barMinHeight = 1;
        const data = [{ type: 'max', name: 'Max' }];
        const type = 'bar';

        return [
            {
                barMinHeight,
                encode: {
                    x: TIME,
                    y: BYTES_READ,
                },
                name: intl.formatMessage(
                    { id: 'data.read' },
                    {
                        type: intl.formatMessage({ id: 'data.data' }),
                    }
                ),
                type,
                yAxisIndex: 0,
            },
            {
                barMinHeight,
                encode: {
                    x: TIME,
                    y: BYTES_WRITTEN,
                },
                markLine: {
                    data,
                    label: {
                        backgroundColor: eChartsColors[0],
                        color: 'white',
                        padding: 3,
                        position: 'start',
                        formatter: ({ value }: any) =>
                            formatter(value, 'bytes', 'to'),
                    },
                    symbolSize: 0,
                },
                name: intl.formatMessage(
                    { id: 'data.written' },
                    {
                        type: intl.formatMessage({ id: 'data.data' }),
                    }
                ),
                type,
                yAxisIndex: 0,
            },
            {
                barMinHeight,
                encode: {
                    x: TIME,
                    y: DOCS_READ,
                },
                name: intl.formatMessage(
                    { id: 'data.read' },
                    {
                        type: intl.formatMessage({ id: 'data.docs' }),
                    }
                ),
                type,
                yAxisIndex: 1,
            },
            {
                barMinHeight,
                encode: {
                    x: TIME,
                    y: DOCS_WRITTEN,
                },
                markLine: {
                    data,
                    label: {
                        backgroundColor: eChartsColors[1],
                        color: 'black',
                        padding: 3,
                        position: 'end',
                        formatter: ({ value }: any) =>
                            formatter(value, 'docs', 'to'),
                    },
                    symbolSize: 0,
                },
                name: intl.formatMessage(
                    { id: 'data.written' },
                    {
                        type: intl.formatMessage({ id: 'data.docs' }),
                    }
                ),
                type,
                yAxisIndex: 1,
            },
        ];
    }, [formatter, intl]);

    // Set the main bulk of the options for the chart
    useEffect(() => {
        let dimensions, series: any;
        if (entityType === 'collection') {
            dimensions = [
                TIME,
                DOCS_READ,
                DOCS_WRITTEN,
                BYTES_READ,
                BYTES_WRITTEN,
            ];
            series = [
                bytesReadSeries,
                bytesWrittenSeries,
                docsReadSeries,
                docsWrittenSeries,
            ];
        } else if (entityType === 'capture') {
            dimensions = [TIME, DOCS_WRITTEN, BYTES_WRITTEN];
            series = [docsWrittenSeries, bytesWrittenSeries];
        } else {
            dimensions = [TIME, DOCS_READ, BYTES_READ];
            series = [bytesReadSeries, docsReadSeries];
        }

        const option: EChartsOption = {
            animation: false,
            darkMode: theme.palette.mode === 'dark',
            legend: legendConfig,
            series,
            useUTC: true,
            // Setting dataset here because setting in a stand alone set option cause the chart to go blank
            dataset: {
                dimensions,
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
            grid: {
                left: 20,
                top: 40,
                right: 20,
                bottom: 10,
                containLabel: true,
            },
        };

        myChart?.setOption(option);
    }, [
        bytesReadSeries,
        bytesWrittenSeries,
        docsReadSeries,
        docsWrittenSeries,
        entityType,
        formatter,
        intl,
        lastUpdated,
        legendConfig,
        myChart,
        scopedDataSet,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
        range, // This is required to cause this to re-render when it changes
    ]);

    return <div id={id} style={{ height: 350 }} />;
}

export default DataByHourGraph;
