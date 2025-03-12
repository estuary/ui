import { TableCell, ToggleButtonGroup } from '@mui/material';
import {
    ConstraintTypes,
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import FieldActionButton from 'components/tables/cells/fieldSelection/FieldActionButton';
import { outlinedToggleButtonGroupStyling } from 'context/Theme';
import { useMemo } from 'react';
import {
    useBinding_recommendFields,
    useBinding_selections,
    useBinding_setSingleSelection,
} from 'stores/Binding/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    isExcludeOnlyField,
    isRecommendedField,
    isRequireOnlyField,
} from 'utils/workflow-utils';

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
) => (selectedValue === toggleValue && recommended ? 'default' : targetValue);

function FieldActions({ bindingUUID, field, constraint }: Props) {
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

    const coloredSelectButton =
        selection?.mode === 'default' && isRecommendedField(constraint.type);

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
                <FieldActionButton
                    messageId="fieldSelection.table.cta.requireField"
                    selectedValue={selection?.mode ?? null}
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
                />

                <FieldActionButton
                    messageId="fieldSelection.table.cta.excludeField"
                    selectedValue={selection?.mode ?? null}
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
                />

                <FieldActionButton
                    messageId="fieldSelection.table.cta.selectField"
                    selectedValue={selection?.mode ?? null}
                    value="default"
                    coloredDefaultState={coloredSelectButton}
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
                />
            </ToggleButtonGroup>
        </TableCell>
    );
}

export default FieldActions;
