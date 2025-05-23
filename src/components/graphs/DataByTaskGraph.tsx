import type { DataVolumeByTask } from 'src/stores/Billing/types';
import type { SeriesConfig } from 'src/utils/billing-utils';

import { useEffect, useMemo, useState } from 'react';
import useConstant from 'use-constant';

import { useTheme } from '@mui/material';

import {
    eachMonthOfInterval,
    isWithinInterval,
    startOfMonth,
    sub,
} from 'date-fns';
import { BarChart } from 'echarts/charts';
import {
    GridComponent,
    LegendComponent,
    MarkLineComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { sortBy, sum, uniq } from 'lodash';
import { useIntl } from 'react-intl';

import {
    getTooltipItem,
    getTooltipTitle,
} from 'src/components/graphs/tooltips';
import useLegendConfig from 'src/components/graphs/useLegendConfig';
import useTooltipConfig from 'src/components/graphs/useTooltipConfig';
import { defaultOutlineColor } from 'src/context/Theme';
import { useBillingStore } from 'src/stores/Billing/Store';
import {
    BYTES_PER_GB,
    CARD_AREA_HEIGHT,
    formatDataVolumeForDisplay,
} from 'src/utils/billing-utils';
import { hasLength } from 'src/utils/misc-utils';

const chartContainerId = 'data-by-task';

const evaluateLargestDataProcessingTasks = (
    dataVolumeByTask: DataVolumeByTask[]
): string[] => {
    const totalDataVolumeByTask: {
        catalogName: string;
        totalDataVolume: number;
    }[] = [];

    const tasks = uniq(dataVolumeByTask.map(({ catalogName }) => catalogName));

    tasks.forEach((catalogName) => {
        const dataVolumes = dataVolumeByTask
            .filter((item) => item.catalogName === catalogName)
            .map(({ dataVolume }) => dataVolume);

        totalDataVolumeByTask.push({
            catalogName,
            totalDataVolume: sum(dataVolumes),
        });
    });

    return sortBy(totalDataVolumeByTask, ['totalDataVolume'])
        .reverse()
        .slice(0, 3)
        .map(({ catalogName }) => catalogName);
};

function DataByTaskGraph() {
    const theme = useTheme();
    const intl = useIntl();
    const tooltipConfig = useTooltipConfig();

    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const dataByTaskGraphDetails = useBillingStore(
        (state) => state.dataByTaskGraphDetails
    );

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    const today = useConstant(() => new Date());

    const months = useMemo(() => {
        const startDate = sub(today, { months: 5 });

        return eachMonthOfInterval({
            start: startDate,
            end: today,
        }).map((date) => intl.formatDate(date, { month: 'short' }));
    }, [intl, today]);

    const seriesConfig: SeriesConfig[] = useMemo(() => {
        const startDate = startOfMonth(sub(today, { months: 5 }));

        const scopedDetails = dataByTaskGraphDetails.filter(({ date }) =>
            isWithinInterval(date, {
                start: startDate,
                end: today,
            })
        );

        return evaluateLargestDataProcessingTasks(scopedDetails).map((task) => {
            const detailsByTask = scopedDetails.filter(
                ({ catalogName }) => catalogName === task
            );

            return {
                seriesName: task,
                data: detailsByTask.map(
                    ({ date, dataVolume }): [string, number] => [
                        intl.formatDate(date, { month: 'short' }),
                        dataVolume,
                    ]
                ),
            };
        });
    }, [dataByTaskGraphDetails, intl, today]);

    const legendConfig = useLegendConfig(seriesConfig);

    useEffect(() => {
        if (billingStoreHydrated && hasLength(seriesConfig)) {
            if (!myChart) {
                echarts.use([
                    GridComponent,
                    LegendComponent,
                    BarChart,
                    CanvasRenderer,
                    UniversalTransition,
                    MarkLineComponent,
                    TooltipComponent,
                ]);

                const chartDom = document.getElementById(chartContainerId);

                setMyChart(chartDom && echarts.init(chartDom));
            }

            window.addEventListener('resize', () => {
                myChart?.resize();
            });

            const option = {
                xAxis: {
                    type: 'category',
                    data: months,
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: '{value} GB',
                    },
                    splitLine: {
                        lineStyle: {
                            color: defaultOutlineColor[theme.palette.mode],
                        },
                    },
                    minInterval: 0.001,
                },
                series: seriesConfig.map(({ seriesName, data }) => ({
                    name: seriesName,
                    type: 'bar',
                    emphasis: {
                        focus: 'series',
                    },
                    barMinHeight: 3,
                    data: data.map(([month, dataVolume]) => [
                        month,
                        (dataVolume / BYTES_PER_GB).toFixed(3),
                    ]),
                })),
                legend: legendConfig,
                textStyle: {
                    color: theme.palette.text.primary,
                },
                tooltip: {
                    ...tooltipConfig,
                    formatter: (tooltipConfigs: any[]) => {
                        let content: string | undefined;

                        tooltipConfigs.forEach((config) => {
                            const dataVolume = formatDataVolumeForDisplay(
                                seriesConfig,
                                config,
                                true
                            );

                            const tooltipItem = getTooltipItem(
                                config.marker,
                                dataVolume
                            );

                            if (content) {
                                content = `${content}${tooltipItem}`;
                            } else {
                                const tooltipTitle =
                                    dataByTaskGraphDetails
                                        .map(({ date }) =>
                                            intl.formatDate(date, {
                                                month: 'short',
                                                year: 'numeric',
                                            })
                                        )
                                        .find((date) =>
                                            date.includes(config.name)
                                        ) ?? config.name;

                                content = `${getTooltipTitle(
                                    tooltipTitle
                                )}${tooltipItem}`;
                            }
                        });

                        return content;
                    },
                },
                grid: {
                    left: 10,
                    top: 50,
                    right: 50,
                    bottom: 0,
                    containLabel: true,
                },
            };

            myChart?.setOption(option);
        }
    }, [
        billingStoreHydrated,
        dataByTaskGraphDetails,
        intl,
        legendConfig,
        months,
        myChart,
        seriesConfig,
        theme.palette.mode,
        theme.palette.text.primary,
        tooltipConfig,
    ]);

    return <div id={chartContainerId} style={{ height: CARD_AREA_HEIGHT }} />;
}

export default DataByTaskGraph;
