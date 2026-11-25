import type { TooltipComponentOption } from 'echarts';

import { useMemo } from 'react';

import useTooltipConfig from 'src/components/graphs/useTooltipConfig';

// The app's axis tooltip at the billing design's size: 12px text, tight
// padding and a thin border.
export function useChartTooltip() {
    const tooltip = useTooltipConfig() as TooltipComponentOption;

    return useMemo<TooltipComponentOption>(
        () => ({
            ...tooltip,
            confine: true,
            padding: [6, 10],
            borderWidth: 1,
            textStyle: { ...tooltip.textStyle, fontSize: 12 },
            extraCssText: 'border-radius:4px',
        }),
        [tooltip]
    );
}
