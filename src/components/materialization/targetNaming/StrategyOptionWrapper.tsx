import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

import { defaultOutline, defaultOutline_hovered } from 'src/context/Theme';

const StrategyOptionWrapper = styled(Box, {
    shouldForwardProp: (prop) =>
        prop !== 'selected' && prop !== 'readOnly' && prop !== 'disabled',
})<{ selected: boolean; readOnly?: boolean; disabled?: boolean }>(
    ({ theme, selected, readOnly, disabled }) => ({
        'border': selected
            ? `1px solid ${theme.palette.primary.main}`
            : defaultOutline[theme.palette.mode],
        'borderRadius': 4,
        'cursor': selected || readOnly || disabled ? 'default' : 'pointer',
        'padding': theme.spacing(1.5),
        // Did this instead of a gray background cause it was easier and
        //  the examples also have backgrounds that would need adjusted
        'opacity': disabled ? 0.8 : 1,
        '&:hover':
            selected || readOnly || disabled
                ? {}
                : {
                      border: defaultOutline_hovered[theme.palette.mode],
                  },
    })
);

export default StrategyOptionWrapper;
