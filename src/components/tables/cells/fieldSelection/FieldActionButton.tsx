import type { FieldActionButtonProps } from 'src/components/tables/cells/types';

import { Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import { TOGGLE_BUTTON_CLASS } from 'src/components/tables/cells/fieldSelection/shared';
import useOnFieldActionClick from 'src/hooks/fieldSelection/useOnFieldActionClick';
import { useFormStateStore_isIdle } from 'src/stores/FormState/hooks';

export default function FieldActionButton({
    bindingUUID,
    disabled,
    field,
    labelId,
    outcome,
    selection,
    tooltipProps,
    ...props
}: FieldActionButtonProps) {
    const intl = useIntl();

    const formIdle = useFormStateStore_isIdle();

    const updateSingleSelection = useOnFieldActionClick(bindingUUID, field);

    if (tooltipProps && disabled && formIdle) {
        // const tooltipReasonId =
        //     // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        //     constraintMessages[outcome.select?.reason]?.translatedId ??
        //     'fieldSelection.table.label.unknown';

        return (
            <Tooltip
                {...tooltipProps}
                title={outcome?.select?.reason ?? outcome?.reject?.reason}
            >
                <span className={TOGGLE_BUTTON_CLASS}>
                    <OutlinedToggleButton
                        {...props}
                        disabled={disabled}
                        onClick={(_event, value) =>
                            updateSingleSelection(value, selection, outcome)
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
            onClick={(_event, value) =>
                updateSingleSelection(value, selection, outcome)
            }
        >
            {intl.formatMessage({ id: labelId })}
        </OutlinedToggleButton>
    );
}
