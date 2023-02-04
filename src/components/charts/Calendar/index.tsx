import { useTheme } from '@mui/material';
import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts';
import { getInstanceByDom, init } from 'echarts';
import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';

// https://dev.to/manufac/using-apache-echarts-with-react-and-typescript-353k
export interface ReactEChartsProps {
    option: EChartsOption;
    style?: CSSProperties;
    settings?: SetOptionOpts;
    loading?: boolean;
}

export function ReactECharts({
    option,
    style,
    settings,
    loading,
}: ReactEChartsProps): JSX.Element {
    const chartRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    useEffect(() => {
        // Initialize chart
        let chart: ECharts | undefined;
        if (chartRef.current !== null) {
            chart = init(chartRef.current, theme.palette.mode);
        }

        // Add chart resize listener
        // ResizeObserver is leading to a bit janky UX
        function resizeChart(arg: any) {
            console.log('resizeChart', arg);
            chart?.resize();
        }
        window.addEventListener('resize', resizeChart);

        // Return cleanup function
        return () => {
            console.log('cleanup');

            chart?.dispose();
            window.removeEventListener('resize', resizeChart);
        };
    }, [theme]);

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            console.log('theme change');

            const chart = getInstanceByDom(chartRef.current);
            chart?.setOption(option, settings);
        }
    }, [option, settings, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            console.log('loading change');

            const chart = getInstanceByDom(chartRef.current);
            loading === true ? chart?.showLoading() : chart?.hideLoading();
        }
    }, [loading, theme]);

    return (
        <div
            ref={chartRef}
            style={{
                width: '100%',
                height: '100%',
                border: '1px solid #000',
                ...style,
            }}
        />
    );
}
