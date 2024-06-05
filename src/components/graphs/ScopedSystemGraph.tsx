import { useTheme } from '@mui/material';
import { EntityNode } from 'api/liveSpecFlows';
import { eChartsColors } from 'context/Theme';
import { EChartsOption } from 'echarts';
import { SankeyChart } from 'echarts/charts';
import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    childNodes: EntityNode[];
    currentNode: EntityNode;
    containerId: string;
    parentNodes: EntityNode[];
}

const getNodeColor = (entityType: string): string => {
    if (entityType === 'collection') {
        return eChartsColors.medium[1];
    }

    if (entityType === 'capture') {
        return eChartsColors.medium[0];
    }

    return eChartsColors.light[0];
};

function ScopedSystemGraph({
    childNodes,
    currentNode,
    containerId,
    parentNodes,
}: Props) {
    const theme = useTheme();

    const [myChart, setMyChart] = useState<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!myChart) {
            echarts.use([
                CanvasRenderer,
                GridComponent,
                LegendComponent,
                SankeyChart,
                TooltipComponent,
            ]);

            const chartDom = document.getElementById(containerId);

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
    }, [containerId, myChart]);

    const [seriesData, links] = useMemo(() => {
        const currentNodeColor = getNodeColor(currentNode.spec_type);

        const data: any[] = [
            {
                name: currentNode.catalog_name,
                itemStyle: {
                    color: currentNodeColor,
                    borderColor: currentNodeColor,
                },
            },
        ];

        const edges: any[] = [];

        const parentLinkValue =
            childNodes.length && parentNodes.length > 0
                ? childNodes.length / parentNodes.length
                : 1;

        parentNodes.forEach(({ catalog_name, spec_type }) => {
            const color = getNodeColor(spec_type);

            data.push({
                name: catalog_name,
                itemStyle: {
                    color,
                    borderColor: color,
                },
            });

            edges.push({
                source: catalog_name,
                target: currentNode.catalog_name,
                value: parentLinkValue,
            });
        });

        childNodes.forEach(({ catalog_name, spec_type }) => {
            const color = getNodeColor(spec_type);

            data.push({
                name: catalog_name,
                itemStyle: {
                    color,
                    borderColor: color,
                },
            });

            edges.push({
                source: currentNode.catalog_name,
                target: catalog_name,
                value: 1,
            });
        });

        return [data, edges];
    }, [childNodes, currentNode, parentNodes]);

    useEffect(() => {
        const option: EChartsOption = {
            animation: false,
            darkMode: theme.palette.mode === 'dark',
            grid: {
                left: 20,
                top: 40,
                right: 20,
                bottom: 10,
                containLabel: true,
            },
            series: [
                {
                    type: 'sankey',
                    data: seriesData,
                    label: {
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 4,
                        padding: 6,
                        verticalAlign: 'middle',
                    },
                    lineStyle: {
                        color: 'source',
                        curveness: 0.5,
                    },
                    links,
                },
            ],
            textStyle: {
                color: theme.palette.text.primary,
            },
            tooltip: {
                trigger: 'item',
            },
        };

        myChart?.setOption(option);
    }, [
        links,
        myChart,
        seriesData,
        theme.palette.background.paper,
        theme.palette.mode,
        theme.palette.text.primary,
    ]);

    return <div id={containerId} style={{ height: 350 }} />;
}

export default ScopedSystemGraph;
