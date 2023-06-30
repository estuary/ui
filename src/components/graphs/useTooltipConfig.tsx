import { useTheme } from '@mui/material';
import { defaultOutlineColor, paperBackground } from 'context/Theme';
import { EChartsOption } from 'echarts';

function useTooltipConfig(): EChartsOption['tooltip'] {
    const theme = useTheme();
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
}

export default useTooltipConfig;
