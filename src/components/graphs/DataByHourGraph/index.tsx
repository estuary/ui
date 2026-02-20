import type { EChartsOption } from 'echarts';
import type { Options } from 'pretty-bytes';
import type { DataByHourStatType } from 'src/components/graphs/types';
import type { CatalogStats_Details } from 'src/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTheme } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

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
import { DateTime } from 'luxon';
import prettyBytes from 'pretty-bytes';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import readable from 'readable-numbers';

import {
    getTooltipItem,
    getTooltipTitle,
} from 'src/components/graphs/tooltips';
import useLegendConfig from 'src/components/graphs/useLegendConfig';
import useTooltipConfig from 'src/components/graphs/useTooltipConfig';
import { useEntityType } from 'src/context/EntityContext';
import { defaultOutlineColor, eChartsColors } from 'src/context/Theme';
import useDataByHourGraphMessages from 'src/hooks/useDataByHourGraphMessages';
import { LUXON_GRAIN_SETTINGS } from 'src/services/luxon';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

interface Props {
    id: string;
    stats: CatalogStats_Details[] | undefined;
    createdAt?: string;
}

// These are keys that are used all over. Not typing them as Echarts typing within
//  dataset complained when I tried
const TIME = 'timestamp';
type Dimensions = keyof CatalogStats_Details;

// Graph styling
const barMinHeight = 1;
const type = 'bar';
const itemStyle = {
    borderRadius: [4, 4, 0, 0],
};

const defaultDataFormat = (value: any, options: Options) => {
    return prettyBytes(value, options);
};

// TODO (data graph) - need to rename this as it can handle multiple grains
//  not renaming as this is not 100% supporting of all the grains
//  just hourly and daily as it required for details not (Q4 2024)
function DataByHourGraph({ id, stats = [] }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const legendConfig = useLegendConfig();
    const tooltipConfig = useTooltipConfig();
    const entityType = useEntityType();
    const messages = useDataByHourGraphMessages();

    const [range, statType] = useDetailsUsageStore(
        useShallow((state) => [state.range, state.statType])
    );
    const { shortFormat, longFormat, getTimeZone, labelKey } =
        LUXON_GRAIN_SETTINGS[range.grain];

    const resizeListener = useRef<EventListener | null>(null);
    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [renderingTimezone, setRenderingTimezone] = useState<string>('');

    const renderingBytes = useMemo(() => statType === 'bytes', [statType]);

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

                resizeListener.current = () => chart.resize();
                window.addEventListener('resize', resizeListener.current);
            }
        }
    }, [id, myChart]);

    useUnmount(() => {
        if (resizeListener.current) {
            window.removeEventListener('resize', resizeListener.current);
        }
    });

    // Update the "last updated" string shown as an xAxis label
    // Want to format with seconds to show more of a "ticking clock" to users
    useEffect(() => {
        // Made a string instead of passing value into message to make life easier
        setLastUpdated(
            `${intl.formatMessage({
                id: 'entityTable.data.lastUpdatedWithColon',
            })} ${DateTime.now().toFormat(`tt ZZZZ`)}`
        );
    }, [intl, stats]);

    // Update the "timezone" string shown at the bottom
    useEffect(() => {
        setRenderingTimezone(
            `${intl.formatMessage(
                {
                    id: 'detailsPanel.graph.timezone',
                },
                {
                    relativeUnit: intl.formatMessage(
                        { id: labelKey },
                        { range: '' }
                    ),
                }
            )} ${getTimeZone(DateTime.now())}`
        );
    }, [getTimeZone, intl, labelKey]);

    getTimeZone;

    // It kind of sucks to be checking the entityType and not just seeing what was returned
    //  However, this prevents us from having to look through ALL the stats to decide what
    //      data to display.
    // Any typing because echarts does not like multiple
    const scopedDataSet = useMemo<any>(() => {
        if (entityType === 'collection') {
            return stats.map((stat) => {
                return {
                    ...stat,
                    [TIME]: stat.ts,
                };
            });
        }

        if (entityType === 'capture') {
            return stats.map((stat) => {
                return {
                    docs_written: stat.docs_written,
                    bytes_written: stat.bytes_written,
                    [TIME]: stat.ts,
                };
            });
        }

        return stats.map((stat) => {
            return {
                docs_read: stat.docs_read,
                bytes_read: stat.bytes_read,
                [TIME]: stat.ts,
            };
        });
    }, [entityType, stats]);

    // Function to format that handles both dimensions. This allows the tooltip
    //  formatter to not worry about dimensions and just pass them in here
    const formatter = useCallback(
        (
            value: any,
            dimension: Dimensions | DataByHourStatType,
            precision?: number
        ) => {
            if (!Number.isInteger(value)) {
                return intl.formatMessage({
                    id: 'common.missing',
                });
            }

            if (dimension.includes('docs')) {
                return `${readable(value, 2, false)}`;
            }
            return `${defaultDataFormat(value, {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
            })}`;
        },
        [intl]
    );

    const [
        bytesWrittenSeries,
        bytesReadSeries,
        docsWrittenSeries,
        docsReadSeries,
    ] = useMemo<EChartsOption['series'][]>(() => {
        const isCollection = entityType === 'collection';
        const barGap = isCollection ? '-100%' : undefined;
        const colorVariation = isCollection ? 'light' : 'medium';

        return [
            {
                barMinHeight,
                color: eChartsColors[colorVariation][0],
                encode: {
                    x: TIME,
                    y: 'bytes_written',
                },
                itemStyle,
                name: messages.dataWritten,
                type,
            },
            {
                barMinHeight,
                barGap,
                color: eChartsColors.medium[0],
                encode: {
                    x: TIME,
                    y: 'bytes_read',
                },
                itemStyle,
                name: messages.dataRead,
                type,
            },
            {
                barMinHeight,
                color: eChartsColors[colorVariation][1],
                encode: {
                    x: TIME,
                    y: 'docs_written',
                },
                itemStyle,
                name: messages.docsWritten,
                type,
            },
            {
                barMinHeight,
                barGap,
                color: eChartsColors.medium[1],
                encode: {
                    x: TIME,
                    y: 'docs_read',
                },
                itemStyle,
                name: messages.docsRead,
                type,
            },
        ];
    }, [
        entityType,
        messages.dataRead,
        messages.dataWritten,
        messages.docsRead,
        messages.docsWritten,
    ]);

    // Populate dimensions and series as needed.
    //  The order of these arrays impact the graph's z index
    useEffect(() => {
        let dimensions, series: any;
        if (entityType === 'collection') {
            if (renderingBytes) {
                dimensions = [TIME, 'bytes_read', 'bytes_written'];
                series = [bytesWrittenSeries, bytesReadSeries];
            } else {
                dimensions = [TIME, 'docs_read', 'docs_written'];
                series = [docsWrittenSeries, docsReadSeries];
            }
        } else if (entityType === 'capture') {
            if (renderingBytes) {
                dimensions = [TIME, 'bytes_written'];
                series = [bytesWrittenSeries];
            } else {
                dimensions = [TIME, 'docs_written'];

                series = [docsWrittenSeries];
            }
        } else {
            // eslint-disable-next-line no-lonely-if
            if (renderingBytes) {
                dimensions = [TIME, 'bytes_read'];
                series = [bytesReadSeries];
            } else {
                dimensions = [TIME, 'docs_read'];
                series = [docsReadSeries];
            }
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
                    content.push(
                        `${getTooltipTitle(
                            longFormat(DateTime.fromISO(axisValue))
                        )}`
                    );

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
                                dimension,
                                2
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
                                return shortFormat(DateTime.fromISO(value));
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
                {
                    data: [renderingTimezone],
                    axisLabel: {
                        align: 'center',
                    },
                    axisLine: {
                        show: false,
                    },
                    axisPointer: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    tooltip: {
                        show: false,
                    },
                    offset: 20,
                    position: 'bottom',
                    silent: true,
                },
            ],
            yAxis: [
                {
                    alignTicks: true,
                    name: intl.formatMessage({
                        id: renderingBytes ? 'data.data' : 'data.docs',
                    }),
                    type: 'value',
                    position: 'left',
                    axisLabel: {
                        fontSize: 14,
                        formatter: (value: any) => {
                            return renderingBytes
                                ? defaultDataFormat(value, {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 1,
                                  })
                                : readable(value, 1, true);
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
        longFormat,
        myChart,
        renderingBytes,
        renderingTimezone,
        scopedDataSet,
        shortFormat,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    return <div id={id} style={{ height: 350 }} />;
}

export default DataByHourGraph;
