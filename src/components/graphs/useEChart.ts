import type { EChartsOption } from 'echarts';
import type { RefObject } from 'react';

import { useEffect, useState } from 'react';

import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([SVGRenderer]);

// A chart drawn as SVG in the container, redrawn whenever `option` changes.
// Callers register the chart types and components their option uses.
export function useEChart(
    containerRef: RefObject<HTMLElement>,
    option: EChartsOption
) {
    const [chart, setChart] = useState<echarts.ECharts | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return undefined;
        }

        const instance = echarts.init(container, null, { renderer: 'svg' });
        // The container can resize without the window, as when the side nav
        // folds.
        const observer = new ResizeObserver(() => instance.resize());
        observer.observe(container);
        setChart(instance);

        return () => {
            observer.disconnect();
            instance.dispose();
        };
    }, [containerRef]);

    useEffect(() => {
        chart?.setOption(option, { notMerge: true });
    }, [chart, option]);

    return chart;
}
