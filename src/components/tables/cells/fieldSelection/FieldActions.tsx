import type { FieldActionsProps } from 'src/components/tables/cells/types';

import { useMemo } from 'react';

import { TableCell } from '@mui/material';

import { ConstraintTypes } from 'src/components/editor/Bindings/FieldSelection/types';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import FieldActionButton from 'src/components/tables/cells/fieldSelection/FieldActionButton';
import { TOGGLE_BUTTON_CLASS } from 'src/components/tables/cells/fieldSelection/shared';
import {
    useBinding_recommendFields,
    useBinding_selections,
} from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import {
    isExcludeOnlyField,
    isRequireOnlyField,
} from 'src/utils/workflow-utils';

function FieldActions({ bindingUUID, field, constraint }: FieldActionsProps) {
    // Bindings Editor Store
    const recommendFields = useBinding_recommendFields();
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

    const requireOnly = isRequireOnlyField(constraint.type);
    const excludeOnly = isExcludeOnlyField(constraint.type);

    if (constraint.type === ConstraintTypes.UNSATISFIABLE) {
        return null;
    }

    return (
        <TableCell>
            <OutlinedToggleButtonGroup
                buttonSelector={`&.${TOGGLE_BUTTON_CLASS}`}
                disabled={formActive}
                exclusive
                size="small"
                value={selection?.mode}
            >
                <FieldActionButton
                    bindingUUID={bindingUUID}
                    color="success"
                    constraint={constraint}
                    disabled={
                        !recommendFields[bindingUUID] ||
                        constraint.type === ConstraintTypes.FIELD_OPTIONAL
                    }
                    field={field}
                    labelId="fieldSelection.table.cta.selectField"
                    selection={selection}
                    tooltipProps={{ placement: 'bottom-start' }}
                    value="default"
                />

                <FieldActionButton
                    bindingUUID={bindingUUID}
                    color="warning"
                    constraint={constraint}
                    disabled={excludeOnly || (requireOnly && !recommendFields)}
                    field={field}
                    labelId="fieldSelection.table.cta.requireField"
                    selection={selection}
                    value="require"
                />

                <FieldActionButton
                    bindingUUID={bindingUUID}
                    color="error"
                    constraint={constraint}
                    disabled={requireOnly || (excludeOnly && !recommendFields)}
                    field={field}
                    labelId="fieldSelection.table.cta.excludeField"
                    selection={selection}
                    tooltipProps={{ placement: 'bottom-end' }}
                    value="exclude"
                />
            </OutlinedToggleButtonGroup>
        </TableCell>
    );
}

export default FieldActions;
