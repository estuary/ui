import { ToggleButton } from '@mui/material';
import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import { intensifiedOutline } from 'context/Theme';
import { MouseEventHandler } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    selectedValue: FieldSelectionType | null;
    value: FieldSelectionType;
    disabled?: boolean;
    onChange?: MouseEventHandler;
    onClick?: MouseEventHandler;
}

// TODO (field selection): Share disabled and shared state styling with the StyledToggleButtonGroup component.
function OutlinedToggleButton({
    messageId,
    selectedValue,
    value,
    disabled,
    onChange,
    onClick,
}: Props) {
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
                '&.Mui-disabled': {
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                },
                '&.Mui-selected': {
                    backgroundColor: 'rgba(58, 86, 202, 0.15)',
                    borderColor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.primary.main,
                },
            }}
        >
            <FormattedMessage id={messageId} />
        </ToggleButton>
    );
}

export default OutlinedToggleButton;
