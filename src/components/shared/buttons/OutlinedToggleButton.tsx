import { styled, ToggleButton, toggleButtonClasses } from '@mui/material';

import {
    defaultOutline,
    defaultOutline_hovered,
    disabledButtonText,
    intensifiedOutline,
} from 'src/context/Theme';

const OutlinedToggleButton = styled(ToggleButton)(({
    color,
    selected,
    theme,
}) => {
    // MUI has ToggleButton automagically handles the color `standard` to be `primary` in their
    //  component. So this is mirroring that.
    //  See: material-ui/packages/mui-material/src/ToggleButton/ToggleButton.js
    const colorKey = color === 'standard' || !color ? 'primary' : color;

    return {
        'padding': '3px 9px',
        'border': intensifiedOutline[theme.palette.mode],
        'borderRadius': 4,
        '&:hover': {
            border: defaultOutline_hovered[theme.palette.mode],
        },
        [`&.${toggleButtonClasses.selected}`]: {
            'backgroundColor': theme.palette[colorKey].alpha_12,
            'border': `1px solid ${theme.palette[colorKey].alpha_50}`,
            'color':
                theme.palette.mode === 'light'
                    ? theme.palette[colorKey].dark
                    : theme.palette[colorKey].main,
            '&:hover': {
                border: `1px solid ${
                    theme.palette.mode === 'light' &&
                    ['success', 'info'].includes(colorKey)
                        ? theme.palette[colorKey].dark
                        : theme.palette[colorKey].main
                }`,
            },
        },
        [`&.${toggleButtonClasses.disabled}`]: selected
            ? {
                  backgroundColor: theme.palette[colorKey].alpha_05,
                  border: `1px solid ${theme.palette[colorKey].alpha_12}`,
                  color: theme.palette[colorKey].alpha_26,
              }
            : {
                  backgroundColor: 'none',
                  border: defaultOutline[theme.palette.mode],
                  color: disabledButtonText[theme.palette.mode],
              },
    };
});

export default OutlinedToggleButton;
