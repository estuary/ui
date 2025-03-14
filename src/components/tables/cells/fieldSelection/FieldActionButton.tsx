import { SxProps, Theme, ToggleButtonProps, useTheme } from '@mui/material';
import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import {
    defaultOutline_hovered,
    disabledButtonText_error,
    disabledButtonText_success,
    errorColoredOutline,
    errorColoredOutline_disabled,
    errorColoredOutline_hovered,
    errorOutlinedButtonBackground,
    errorOutlinedButtonBackground_disabled,
    successButtonText,
    successColoredOutline,
    successColoredOutline_disabled,
    successColoredOutline_hovered,
    successOutlinedButtonBackground,
    successOutlinedButtonBackground_disabled,
} from 'context/Theme';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    selectedValue: FieldSelectionType | null;
    value: FieldSelectionType;
    coloredDefaultState?: boolean;
    disabled?: boolean;
    onChange?: ToggleButtonProps['onChange'];
    onClick?: ToggleButtonProps['onClick'];
}

const getBackgroundColor = (value: FieldSelectionType, disabled?: boolean) => {
    if (disabled) {
        return value === 'require'
            ? successOutlinedButtonBackground_disabled
            : errorOutlinedButtonBackground_disabled;
    }

    return value === 'require'
        ? successOutlinedButtonBackground
        : errorOutlinedButtonBackground;
};

const getOutline = (value: FieldSelectionType, disabled?: boolean) => {
    if (disabled) {
        return value === 'require'
            ? successColoredOutline_disabled
            : errorColoredOutline_disabled;
    }

    return value === 'require' ? successColoredOutline : errorColoredOutline;
};

const getTextColor = (
    theme: Theme,
    value: FieldSelectionType,
    disabled?: boolean
) => {
    if (disabled) {
        return value === 'require'
            ? disabledButtonText_success[theme.palette.mode]
            : disabledButtonText_error;
    }

    return value === 'require'
        ? successButtonText[theme.palette.mode]
        : theme.palette.error.main;
};

const getBaseSx = (
    theme: Theme,
    value: FieldSelectionType,
    disabled?: boolean
) => {
    const backgroundColor = getBackgroundColor(value, disabled);
    const outline = getOutline(value, disabled);

    return {
        backgroundColor: backgroundColor[theme.palette.mode],
        border: outline[theme.palette.mode],
        color: getTextColor(theme, value, disabled),
    };
};

function FieldActionButton({
    messageId,
    selectedValue,
    value,
    coloredDefaultState,
    disabled,
    onChange,
    onClick,
}: Props) {
    const theme = useTheme();

    const hoveredOutline =
        value === 'require'
            ? successColoredOutline_hovered
            : errorColoredOutline_hovered;

    const baseSx = getBaseSx(theme, value, disabled);

    const defaultStateSx: SxProps<Theme> = coloredDefaultState
        ? {
              ...baseSx,
              '&:hover': {
                  border: hoveredOutline[theme.palette.mode],
              },
          }
        : {
              '&:hover': {
                  border: defaultOutline_hovered[theme.palette.mode],
              },
          };

    const disabledStateSx: SxProps<Theme> = coloredDefaultState
        ? baseSx
        : {
              border: `1px solid ${theme.palette.divider}`,
          };

    const selectedStateSx: SxProps<Theme> = disabled
        ? baseSx
        : {
              ...baseSx,
              '&:hover': {
                  border: hoveredOutline[theme.palette.mode],
              },
          };

    return (
        <OutlinedToggleButton
            size="small"
            value={value}
            selected={selectedValue === value}
            defaultStateSx={defaultStateSx}
            disabled={disabled}
            disabledStateSx={disabledStateSx}
            onChange={onChange}
            onClick={onClick}
            selectedStateSx={selectedStateSx}
        >
            <FormattedMessage id={messageId} />
        </OutlinedToggleButton>
    );
}

export default FieldActionButton;
