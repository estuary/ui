import type { EChartsOption } from 'echarts';

import { useMemo } from 'react';

import { useTheme } from '@mui/material';

import { defaultOutlineColor, paperBackground } from 'src/context/Theme';

function useTooltipConfig(): EChartsOption['tooltip'] {
    const theme = useTheme();
    return useMemo(() => {
        return {
            backgroundColor: paperBackground[theme.palette.mode],
            borderColor: defaultOutlineColor[theme.palette.mode],
            trigger: 'axis',
            textStyle: {
                color: theme.palette.text.primary,
                fontWeight: 'normal',
            },
            axisPointer: {
                type: 'shadow',
            },
        };
    }, [theme.palette.mode, theme.palette.text.primary]);
}

export default useTooltipConfig;
