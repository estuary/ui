import { ToggleButton, ToggleButtonProps } from '@mui/material';
import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import { useBindingsEditorStore_selectionSaving } from 'components/editor/Bindings/Store/hooks';
import { intensifiedOutline } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    selectedValue: FieldSelectionType | null;
    value: FieldSelectionType;
    disabled?: boolean;
    onChange?: ToggleButtonProps['onChange'];
    onClick?: ToggleButtonProps['onClick'];
}

function OutlinedToggleButton({
    messageId,
    selectedValue,
    value,
    disabled,
    onChange,
    onClick,
}: Props) {
    const selectionSaving = useBindingsEditorStore_selectionSaving();

    return (
        <ToggleButton
            size="small"
            value={value}
            selected={selectedValue === value}
            disabled={selectionSaving || disabled}
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
                '&.Mui-selected': selectionSaving
                    ? {
                          backgroundColor: 'rgba(58, 86, 202, 0.10)',
                          borderColor: 'rgba(58, 86, 202, 0.75)',
                          color: 'rgba(58, 86, 202, 0.75)',
                      }
                    : {
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
