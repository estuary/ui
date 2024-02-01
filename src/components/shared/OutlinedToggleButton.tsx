import {
    SxProps,
    Theme,
    ToggleButton,
    ToggleButtonProps,
    toggleButtonClasses,
    useTheme,
} from '@mui/material';
import {
    intensifiedOutline,
    outlinedButtonBackground,
    primaryColoredOutline,
    primaryColoredOutline_hovered,
} from 'context/Theme';

interface Props extends ToggleButtonProps {
    defaultStateSx?: SxProps<Theme>;
    disabledStateSx?: SxProps<Theme>;
    selectedStateSx?: SxProps<Theme>;
}

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
}: Props) {
    const theme = useTheme();

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
    };

    if (defaultStateSx) {
        sx = { ...sx, ...defaultStateSx };
    }

    if (disabledStateSx) {
        sx = { ...sx, [`&.${toggleButtonClasses.disabled}`]: disabledStateSx };
    }

    return (
        <ToggleButton
            {...props}
            size="small"
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
