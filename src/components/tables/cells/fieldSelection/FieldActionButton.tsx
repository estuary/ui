import type { FieldActionButtonProps } from 'src/components/tables/cells/types';

import { Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import {
    fieldOutcomeMessages,
    TOGGLE_BUTTON_CLASS,
} from 'src/components/tables/cells/fieldSelection/shared';
import useOnFieldActionClick from 'src/hooks/fieldSelection/useOnFieldActionClick';
import { useFormStateStore_isIdle } from 'src/stores/FormState/hooks';

export function FieldActionButton({
    bindingUUID,
    disabled,
    field,
    label,
    outcome,
    selection,
    tooltipProps,
    ...props
}: Omit<FieldActionButtonProps, 'labelId'> & { label: string }) {
    const formIdle = useFormStateStore_isIdle();

    const updateSingleSelection = useOnFieldActionClick(bindingUUID, field);

    if (tooltipProps && disabled && formIdle) {
        const tooltipReason =
            (outcome.select && !outcome.reject) ||
            (!outcome.select && outcome.reject)
                ? fieldOutcomeMessages[
                      outcome.select?.reason?.type ??
                          outcome.reject?.reason?.type ??
                          ''
                  ]?.tooltip
                : '';

        return (
            <Tooltip
                {...tooltipProps}
                title={tooltipReason.length > 0 ? tooltipReason : null}
            >
                <span className={TOGGLE_BUTTON_CLASS}>
                    <OutlinedToggleButton
                        {...props}
                        disabled={disabled}
                        onClick={(_event, value) =>
                            updateSingleSelection(value, selection, outcome)
                        }
                    >
                        {label}
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
            {label}
        </OutlinedToggleButton>
    );
}

/** @deprecated Prefer the named `FieldActionButton` export */
export default function FieldActionButtonWrapper({
    labelId,
    ...props
}: FieldActionButtonProps) {
    const intl = useIntl();

    return (
        <FieldActionButton
            {...props}
            label={intl.formatMessage({ id: labelId })}
        />
    );
}
