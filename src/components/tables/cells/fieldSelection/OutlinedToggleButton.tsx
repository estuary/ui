import { SxProps, Theme, ToggleButton, ToggleButtonProps } from '@mui/material';
import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import {
    disabledButtonText_primary,
    intensifiedOutline,
    outlinedButtonBackground,
    outlinedButtonBackground_disabled,
    primaryColoredOutline,
    primaryColoredOutline_disabled,
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

function OutlinedToggleButton({
    messageId,
    selectedValue,
    value,
    coloredDefaultState,
    disabled,
    onChange,
    onClick,
}: Props) {
    const defaultStateSx: SxProps<Theme> = coloredDefaultState
        ? {
              border: (theme) => primaryColoredOutline[theme.palette.mode],
              color: (theme) => theme.palette.primary.main,
          }
        : {};

    const disabledStateSx: SxProps<Theme> = coloredDefaultState
        ? {
              border: (theme) =>
                  primaryColoredOutline_disabled[theme.palette.mode],
              color: (theme) => disabledButtonText_primary[theme.palette.mode],
          }
        : {
              border: (theme) => `1px solid ${theme.palette.divider}`,
          };

    const selectedStateSx: SxProps<Theme> = disabled
        ? {
              backgroundColor: (theme) =>
                  outlinedButtonBackground_disabled[theme.palette.mode],
              border: (theme) =>
                  primaryColoredOutline_disabled[theme.palette.mode],
              color: (theme) => disabledButtonText_primary[theme.palette.mode],
          }
        : {
              backgroundColor: (theme) =>
                  outlinedButtonBackground[theme.palette.mode],
              borderColor: (theme) => theme.palette.primary.main,
              color: (theme) => theme.palette.primary.main,
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
