import type { EChartsOption } from 'echarts';
import type { Options } from 'pretty-bytes';
import type { CatalogStatsDetails } from 'src/api/catalogStats';
import type { DataByHourStatType } from 'src/components/graphs/types';

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
import { debounce } from 'lodash';
import { DateTime } from 'luxon';
import prettyBytes from 'pretty-bytes';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import readable from 'readable-numbers';

import {
    getTooltipItem,
    getTooltipTitle,
} from 'src/components/graphs/tooltips';
import { DataGrains } from 'src/components/graphs/types';
import useLegendConfig from 'src/components/graphs/useLegendConfig';
import useTooltipConfig from 'src/components/graphs/useTooltipConfig';
import { useEntityType } from 'src/context/EntityContext';
import { defaultOutlineColor, eChartsColors } from 'src/context/Theme';
import useDataByHourGraphMessages from 'src/hooks/useDataByHourGraphMessages';
import { LUXON_GRAIN_SETTINGS } from 'src/services/luxon';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

interface DataByHourGraphProps {
    id: string;
    stats?: CatalogStatsDetails[];
    createdAt?: string;
    updatedAt: string;
}

// These are keys that are used all over. Not typing them as Echarts typing within
//  dataset complained when I tried
const TIME = 'timestamp';
type Dimensions = keyof CatalogStatsDetails;

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
// This handled monthly grain fine after updating "renderingTimezone" (Q1 2026)
function DataByHourGraph({ id, stats = [], updatedAt }: DataByHourGraphProps) {
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

    const resizeObserver = useRef<ResizeObserver | null>(null);
    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);
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

                // Observe both the chart element and the document body. Need to
                // observe the chart because collapsing the navigation sidebar resizes
                // this container without resizing the window. Need to observe the body
                // to capture actual window resizes.
                resizeObserver.current = new ResizeObserver(
                    debounce(() => chart.resize(), 50)
                );

                resizeObserver.current.observe(chartDom);
                resizeObserver.current.observe(document.body);
            }
        }
    }, [id, myChart]);

    useUnmount(() => {
        resizeObserver.current?.disconnect();
    });

    // Update the "timezone" string shown at the bottom
    useEffect(() => {
        setRenderingTimezone(
            `${intl.formatMessage(
                {
                    id: 'detailsPanel.graph.timezone',
                },
                {
                    relativeUnit:
                        range.grain === DataGrains.monthly
                            ? ''
                            : intl.formatMessage(
                                  { id: labelKey },
                                  { range: '' }
                              ),
                }
            )} ${getTimeZone(DateTime.now())}`
        );
    }, [getTimeZone, intl, labelKey, range.grain]);

    getTimeZone;

    const scopedDataSet = useMemo(() => {
        return stats.map((stat) => {
            return {
                docs_read: stat.docsRead,
                bytes_read: stat.bytesRead,
                docs_written: stat.docsWritten,
                bytes_written: stat.bytesWritten,
                [TIME]: DateTime.fromSeconds(stat.timestamp).toISO(),
            };
        });
    }, [stats]);

    // Function to format that handles both dimensions. This allows the tooltip
    //  formatter to not worry about dimensions and just pass them in here
    const formatter = useCallback(
        (
            value: any,
            dimension: Dimensions | DataByHourStatType,
            precision?: number
        ) => {
            if (!Number.isInteger(value)) {
                return 'N/A';
            }

            if (dimension.includes('docs')) {
                return `${readable(value, 2, false)}`;
            }
            return `${defaultDataFormat(value, {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
            })}`;
        },
        []
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
                    data: [`Last Updated: ${updatedAt}`],
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
        updatedAt,
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
