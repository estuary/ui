import { Tooltip } from '@mui/material';
import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import useOnFieldActionClick from 'hooks/fieldSelection/useOnFieldActionClick';
import { useIntl } from 'react-intl';
import { useFormStateStore_isIdle } from 'stores/FormState/hooks';
import { getConstraintMessageId } from './shared';
import { FieldActionButtonProps } from './types';

export default function FieldActionButton({
    bindingUUID,
    constraint,
    disabled,
    field,
    labelId,
    selection,
    tooltipPlacement,
    ...props
}: FieldActionButtonProps) {
    const intl = useIntl();

    const formIdle = useFormStateStore_isIdle();

    const updateSingleSelection = useOnFieldActionClick(bindingUUID, field);

    if (disabled && formIdle) {
        return (
            <Tooltip
                title={intl.formatMessage(
                    { id: 'fieldSelection.table.tooltip.disabledRowAction' },
                    {
                        reason: intl.formatMessage({
                            id: getConstraintMessageId(constraint.type),
                        }),
                    }
                )}
                placement={tooltipPlacement}
            >
                <span className="toggle-button">
                    <OutlinedToggleButton
                        {...props}
                        disabled={disabled}
                        onClick={(_event, value) =>
                            updateSingleSelection(value, selection)
                        }
                    >
                        {intl.formatMessage({ id: labelId })}
                    </OutlinedToggleButton>
                </span>
            </Tooltip>
        );
    }

    return (
        <OutlinedToggleButton
            {...props}
            className="toggle-button"
            disabled={disabled}
            onClick={(_event, value) => updateSingleSelection(value, selection)}
        >
            {intl.formatMessage({ id: labelId })}
        </OutlinedToggleButton>
    );
}
