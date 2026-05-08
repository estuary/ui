import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

import { defaultOutline, defaultOutline_hovered } from 'src/context/Theme';

const StrategyOptionWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'readOnly',
})<{ selected: boolean; readOnly?: boolean }>(
    ({ theme, selected, readOnly }) => ({
        'border': selected
            ? `1px solid ${theme.palette.primary.main}`
            : defaultOutline[theme.palette.mode],
        'borderRadius': 4,
        'cursor': selected || readOnly ? 'default' : 'pointer',
        'padding': theme.spacing(1.5),
        '&:hover':
            selected || readOnly
                ? {}
                : {
                      border: defaultOutline_hovered[theme.palette.mode],
                  },
    })
);

export default StrategyOptionWrapper;
