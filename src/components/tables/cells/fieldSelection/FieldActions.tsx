import { TableCell, ToggleButtonGroup } from '@mui/material';
import {
    ConstraintTypes,
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import { outlinedToggleButtonGroupStyling } from 'context/Theme';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import {
    useBinding_recommendFields,
    useBinding_selections,
    useBinding_setSingleSelection,
} from 'stores/Binding/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { isExcludeOnlyField, isRequireOnlyField } from 'utils/workflow-utils';

interface Props {
    bindingUUID: string;
    field: string;
    constraint: TranslatedConstraint;
    selectionType: FieldSelectionType | null;
}

const evaluateSelectionType = (
    recommended: boolean,
    toggleValue: FieldSelectionType,
    selectedValue: FieldSelectionType | null,
    targetValue: FieldSelectionType | null
) => {
    logRocketEvent(CustomEvents.FIELD_SELECTION, {
        recommended,
        selectedValue,
        targetValue,
        toggleValue,
    });

    return selectedValue === toggleValue && recommended
        ? 'default'
        : targetValue;
};

function FieldActions({ bindingUUID, field, constraint }: Props) {
    const intl = useIntl();

    // Bindings Editor Store
    const recommendFields = useBinding_recommendFields();

    const selections = useBinding_selections();
    const setSingleSelection = useBinding_setSingleSelection();

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
            <ToggleButtonGroup
                size="small"
                exclusive
                sx={outlinedToggleButtonGroupStyling}
            >
                <OutlinedToggleButton
                    color="success"
                    disabled={formActive || !recommendFields[bindingUUID]}
                    onClick={() => {
                        const singleValue =
                            selection?.mode !== 'default' ? 'default' : null;

                        const selectionType = evaluateSelectionType(
                            recommendFields[bindingUUID],
                            'default',
                            selection?.mode ?? null,
                            singleValue
                        );

                        setSingleSelection(
                            bindingUUID,
                            field,
                            selectionType,
                            selection?.meta
                        );
                    }}
                    selected={selection?.mode === 'default'}
                    size="small"
                    value="default"
                >
                    {intl.formatMessage({
                        id: 'fieldSelection.table.cta.selectField',
                    })}
                </OutlinedToggleButton>

                <OutlinedToggleButton
                    color="warning"
                    selected={selection?.mode === 'require'}
                    value="require"
                    disabled={
                        formActive ||
                        excludeOnly ||
                        (requireOnly && !recommendFields)
                    }
                    onClick={() => {
                        const singleValue =
                            selection?.mode !== 'require' ? 'require' : null;

                        const selectionType = evaluateSelectionType(
                            recommendFields[bindingUUID],
                            'require',
                            selection?.mode ?? null,
                            singleValue
                        );

                        setSingleSelection(
                            bindingUUID,
                            field,
                            selectionType,
                            selection?.meta
                        );
                    }}
                >
                    {intl.formatMessage({
                        id: 'fieldSelection.table.cta.requireField',
                    })}
                </OutlinedToggleButton>

                <OutlinedToggleButton
                    color="error"
                    selected={selection?.mode === 'exclude'}
                    value="exclude"
                    disabled={
                        formActive ||
                        requireOnly ||
                        (excludeOnly && !recommendFields)
                    }
                    onClick={() => {
                        const singleValue =
                            selection?.mode !== 'exclude' ? 'exclude' : null;

                        const selectionType = evaluateSelectionType(
                            recommendFields[bindingUUID],
                            'exclude',
                            selection?.mode ?? null,
                            singleValue
                        );

                        setSingleSelection(bindingUUID, field, selectionType);
                    }}
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
