import { Tooltip } from '@mui/material';
import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import useOnFieldActionClick from 'hooks/fieldSelection/useOnFieldActionClick';
import { useIntl } from 'react-intl';
import { useFormStateStore_isIdle } from 'stores/FormState/hooks';
import { getConstraintMessageId, TOGGLE_BUTTON_CLASS } from './shared';
import { FieldActionButtonProps } from './types';

export default function FieldActionButton({
    bindingUUID,
    constraint,
    disabled,
    field,
    labelId,
    selection,
    tooltipProps,
    ...props
}: FieldActionButtonProps) {
    const intl = useIntl();

    const formIdle = useFormStateStore_isIdle();

    const updateSingleSelection = useOnFieldActionClick(bindingUUID, field);

    if (tooltipProps && disabled && formIdle) {
        return (
            <Tooltip
                {...tooltipProps}
                title={intl.formatMessage(
                    { id: 'fieldSelection.table.tooltip.disabledRowAction' },
                    {
                        reason: intl.formatMessage({
                            id: getConstraintMessageId(constraint.type),
                        }),
                    }
                )}
            >
                <span className={TOGGLE_BUTTON_CLASS}>
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
            className={TOGGLE_BUTTON_CLASS}
            disabled={disabled}
            onClick={(_event, value) => updateSingleSelection(value, selection)}
        >
            {intl.formatMessage({ id: labelId })}
        </OutlinedToggleButton>
    );
}
