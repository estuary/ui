import {
    SxProps,
    Theme,
    ToggleButton,
    toggleButtonClasses,
    useTheme,
} from '@mui/material';
import {
    defaultOutline,
    disabledButtonText,
    disabledButtonText_primary,
    intensifiedOutline,
    outlinedButtonBackground,
    outlinedButtonBackground_disabled,
    primaryColoredOutline,
    primaryColoredOutline_disabled,
    primaryColoredOutline_hovered,
} from 'context/Theme';
import { OutlinedToggleButtonProps } from './types';

function OutlinedToggleButton({
    children,
    defaultStateSx,
    disabled,
    disabledStateSx,
    selectedStateSx,
    selected,
    value,
    onChange,
    onClick,
    ...props
}: OutlinedToggleButtonProps) {
    const theme = useTheme();

    const defaultDisabledStateSx: SxProps<Theme> = selected
        ? {
              backgroundColor:
                  outlinedButtonBackground_disabled[theme.palette.mode],
              border: primaryColoredOutline_disabled[theme.palette.mode],
              color: disabledButtonText_primary[theme.palette.mode],
          }
        : {
              backgroundColor: 'none',
              border: defaultOutline[theme.palette.mode],
              color: disabledButtonText[theme.palette.mode],
          };

    let sx: SxProps<Theme> = {
        px: '9px',
        py: '3px',
        border: intensifiedOutline[theme.palette.mode],
        borderRadius: 2,
        [`&.${toggleButtonClasses.selected}`]: selectedStateSx ?? {
            'backgroundColor': outlinedButtonBackground[theme.palette.mode],
            'border': primaryColoredOutline[theme.palette.mode],
            'color': theme.palette.primary.main,
            '&:hover': {
                border: primaryColoredOutline_hovered[theme.palette.mode],
            },
        },
        [`&.${toggleButtonClasses.disabled}`]:
            disabledStateSx ?? defaultDisabledStateSx,
    };

    if (defaultStateSx) {
        sx = { ...sx, ...defaultStateSx };
    }

    return (
        <ToggleButton
            size="small"
            {...props}
            value={value}
            selected={selected}
            disabled={disabled}
            onChange={onChange}
            onClick={onClick}
            sx={sx}
        >
            {children}
        </ToggleButton>
    );
}

export default OutlinedToggleButton;
