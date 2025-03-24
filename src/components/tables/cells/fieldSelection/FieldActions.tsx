import { TableCell, ToggleButtonGroup } from '@mui/material';
import { ConstraintTypes } from 'components/editor/Bindings/FieldSelection/types';
import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import { outlinedToggleButtonGroupStyling } from 'context/Theme';
import useOnFieldActionClick from 'hooks/fieldSelection/useOnFieldActionClick';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_recommendFields,
    useBinding_selections,
} from 'stores/Binding/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { isExcludeOnlyField, isRequireOnlyField } from 'utils/workflow-utils';
import { FieldActionsProps } from './types';

function FieldActions({ bindingUUID, field, constraint }: FieldActionsProps) {
    const intl = useIntl();

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

    const updateSingleSelection = useOnFieldActionClick(bindingUUID, field);

    const requireOnly = isRequireOnlyField(constraint.type);
    const excludeOnly = isExcludeOnlyField(constraint.type);

    if (constraint.type === ConstraintTypes.UNSATISFIABLE) {
        return null;
    }

    return (
        <TableCell>
            <ToggleButtonGroup
                exclusive
                size="small"
                sx={outlinedToggleButtonGroupStyling}
                value={selection?.mode}
            >
                <OutlinedToggleButton
                    color="success"
                    disabled={formActive || !recommendFields[bindingUUID]}
                    onClick={(_event, value) =>
                        updateSingleSelection(value, selection)
                    }
                    size="small"
                    value="default"
                >
                    {intl.formatMessage({
                        id: 'fieldSelection.table.cta.selectField',
                    })}
                </OutlinedToggleButton>

                <OutlinedToggleButton
                    color="warning"
                    value="require"
                    disabled={
                        formActive ||
                        excludeOnly ||
                        (requireOnly && !recommendFields)
                    }
                    onClick={(_event, value) =>
                        updateSingleSelection(value, selection)
                    }
                >
                    {intl.formatMessage({
                        id: 'fieldSelection.table.cta.requireField',
                    })}
                </OutlinedToggleButton>

                <OutlinedToggleButton
                    color="error"
                    value="exclude"
                    disabled={
                        formActive ||
                        requireOnly ||
                        (excludeOnly && !recommendFields)
                    }
                    onClick={(_event, value) =>
                        updateSingleSelection(value, selection)
                    }
                >
                    {intl.formatMessage({
                        id: 'fieldSelection.table.cta.excludeField',
                    })}
                </OutlinedToggleButton>
            </ToggleButtonGroup>
        </TableCell>
    );
}

export default FieldActions;
