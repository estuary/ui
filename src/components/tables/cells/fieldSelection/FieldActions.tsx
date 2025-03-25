import { TableCell } from '@mui/material';
import { ConstraintTypes } from 'components/editor/Bindings/FieldSelection/types';
import OutlinedToggleButtonGroup from 'components/shared/OutlinedToggleButtonGroup';
import { useMemo } from 'react';
import {
    useBinding_recommendFields,
    useBinding_selections,
} from 'stores/Binding/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { isExcludeOnlyField, isRequireOnlyField } from 'utils/workflow-utils';
import FieldActionButton from './FieldActionButton';
import { FieldActionsProps } from './types';

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
                buttonSelector="&.toggle-button"
                disabled={formActive}
                exclusive
                size="small"
                value={selection?.mode}
            >
                <FieldActionButton
                    bindingUUID={bindingUUID}
                    color="success"
                    constraint={constraint}
                    disabled={!recommendFields[bindingUUID]}
                    field={field}
                    labelId="fieldSelection.table.cta.selectField"
                    selection={selection}
                    tooltipPlacement="bottom-start"
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
                    tooltipPlacement="bottom-end"
                    value="exclude"
                />
            </OutlinedToggleButtonGroup>
        </TableCell>
    );
}

export default FieldActions;
