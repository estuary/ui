import { useTheme } from '@mui/material';
import { defaultOutlineColor, eChartsColors } from 'context/Theme';
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
import { orderBy } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { useEffect, useMemo, useState } from 'react';
import { FormatDateOptions, useIntl } from 'react-intl';
import readable from 'readable-numbers';
import { CatalogStats_Details } from 'types';
import { DataByHourRange } from '../types';
import useLegendConfig from '../useLegendConfig';
import useTooltipConfig from '../useTooltipConfig';

interface Props {
    range: DataByHourRange;
    stats: CatalogStats_Details[] | undefined;
    createdAt?: string;
}

interface LocalData {
    docs: number;
    bytes: number;
    time: Date;
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
    console.log('range', range);

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

    // Create a dataset the groups things based on time
    const scopedDataSet = useMemo(() => {
        return stats.map((stat) => {
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
                time: new Date(stat.ts),
            };
        });
    }, [stats]);

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
            dataset: {
                dimensions: ['time', 'bytes', 'docs'],
                source: scopedDataSet,
            },
            xAxis: [
                {
                    axisLabel: {
                        align: 'center',
                        formatter: (value: any) => {
                            console.log('xAxis formatter', value);
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
        intl,
        lastUpdated,
        legendConfig,
        myChart,
        scopedDataSet,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

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

        // Update mychart series so new data goes in
        myChart?.setOption({
            series: [bytesSeries, docsSeries],
        });
    }, [intl, myChart]);

    return <div id="data-by-hour" style={{ height: 350 }} />;
}

export default DataByHourGraph;
