import { SxProps, Theme, ToggleButton, ToggleButtonProps } from '@mui/material';
import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import {
    disabledButtonText_error,
    disabledButtonText_success,
    errorColoredOutline,
    errorColoredOutline_disabled,
    errorOutlinedButtonBackground,
    errorOutlinedButtonBackground_disabled,
    intensifiedOutline,
    successButtonText,
    successColoredOutline,
    successColoredOutline_disabled,
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

const getTextColor = (theme: Theme, value: FieldSelectionType) =>
    value === 'include'
        ? successButtonText[theme.palette.mode]
        : theme.palette.error.main;

const getDisabledTextColor = (theme: Theme, value: FieldSelectionType) =>
    value === 'include'
        ? disabledButtonText_success[theme.palette.mode]
        : disabledButtonText_error;

function OutlinedToggleButton({
    messageId,
    selectedValue,
    value,
    coloredDefaultState,
    disabled,
    onChange,
    onClick,
}: Props) {
    const backgroundColor =
        value === 'include'
            ? successOutlinedButtonBackground
            : errorOutlinedButtonBackground;

    const disabledBackgroundColor =
        value === 'include'
            ? successOutlinedButtonBackground_disabled
            : errorOutlinedButtonBackground_disabled;

    const outline =
        value === 'include' ? successColoredOutline : errorColoredOutline;

    const disabledOutline =
        value === 'include'
            ? successColoredOutline_disabled
            : errorColoredOutline_disabled;

    const defaultStateSx: SxProps<Theme> = coloredDefaultState
        ? {
              backgroundColor: (theme) => backgroundColor[theme.palette.mode],
              border: (theme) => outline[theme.palette.mode],
              color: (theme) => getTextColor(theme, value),
          }
        : {};

    const disabledStateSx: SxProps<Theme> = coloredDefaultState
        ? {
              backgroundColor: (theme) =>
                  disabledBackgroundColor[theme.palette.mode],
              border: (theme) => disabledOutline[theme.palette.mode],
              color: (theme) => getDisabledTextColor(theme, value),
          }
        : {
              border: (theme) => `1px solid ${theme.palette.divider}`,
          };

    const selectedStateSx: SxProps<Theme> = disabled
        ? {
              backgroundColor: (theme) =>
                  disabledBackgroundColor[theme.palette.mode],
              border: (theme) => disabledOutline[theme.palette.mode],
              color: (theme) => getDisabledTextColor(theme, value),
          }
        : {
              backgroundColor: (theme) => backgroundColor[theme.palette.mode],
              border: (theme) => outline[theme.palette.mode],
              color: (theme) => getTextColor(theme, value),
          };

    return (
        <ToggleButton
            size="small"
            value={value}
            selected={selectedValue === value}
            disabled={disabled}
            onChange={onChange}
            onClick={onClick}
            sx={{
                'px': '9px',
                'py': '3px',
                'border': (theme) => intensifiedOutline[theme.palette.mode],
                'borderRadius': 2,
                '&.Mui-disabled': disabledStateSx,
                '&.Mui-selected': selectedStateSx,
                ...defaultStateSx,
            }}
        >
            <FormattedMessage id={messageId} />
        </ToggleButton>
    );
}

export default OutlinedToggleButton;
