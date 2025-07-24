import type { FieldActionsProps } from 'src/components/tables/cells/types';

import { useMemo } from 'react';

import { TableCell } from '@mui/material';

import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import FieldActionButton from 'src/components/tables/cells/fieldSelection/FieldActionButton';
import { TOGGLE_BUTTON_CLASS } from 'src/components/tables/cells/fieldSelection/shared';
import { useBinding_selections } from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function FieldActions({ bindingUUID, field, outcome }: FieldActionsProps) {
    // Bindings Editor Store
    const selections = useBinding_selections();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    const selection = useMemo(
        () =>
            Object.hasOwn(selections, bindingUUID)
                ? selections[bindingUUID][field]
                : null,
        [bindingUUID, field, selections]
    );

    return (
        <TableCell>
            <OutlinedToggleButtonGroup
                buttonSelector={`&.${TOGGLE_BUTTON_CLASS}`}
                disabled={formActive}
                exclusive
                size="small"
                value={selection?.mode}
            >
                {/* <FieldActionButton
                    bindingUUID={bindingUUID}
                    color="primary"
                    disabled={
                        outcome?.reject?.reason === RejectReason.NOT_SELECTED
                    }
                    field={field}
                    labelId="fieldSelection.table.cta.selectField"
                    outcome={outcome}
                    selection={selection}
                    tooltipProps={{ placement: 'bottom-start' }}
                    value="default"
                /> */}

                <FieldActionButton
                    bindingUUID={bindingUUID}
                    color="primary"
                    field={field}
                    labelId="fieldSelection.table.cta.requireField"
                    outcome={outcome}
                    selection={selection}
                    value="require"
                />

                <FieldActionButton
                    bindingUUID={bindingUUID}
                    color="primary"
                    field={field}
                    labelId="fieldSelection.table.cta.excludeField"
                    outcome={outcome}
                    selection={selection}
                    tooltipProps={{ placement: 'bottom-end' }}
                    value="exclude"
                />
            </OutlinedToggleButtonGroup>
        </TableCell>
    );
}

export default FieldActions;
