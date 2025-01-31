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
    evaluateRecommendedIncludedFields,
    evaluateRequiredExcludedFields,
    evaluateRequiredIncludedFields,
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
    singleValue: FieldSelectionType | null
) => (selectedValue === toggleValue && recommended ? 'default' : singleValue);

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

    const includeRequired = evaluateRequiredIncludedFields(constraint.type);
    const includeRecommended = evaluateRecommendedIncludedFields(
        constraint.type
    );

    const excludeRequired = evaluateRequiredExcludedFields(constraint.type);

    const coloredIncludeButton =
        selection?.mode === 'default' && includeRecommended;

    const coloredExcludeButton =
        selection?.mode === 'default' && !includeRecommended;

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
                    messageId="fieldSelection.table.cta.includeField"
                    selectedValue={selection?.mode ?? null}
                    value="include"
                    coloredDefaultState={coloredIncludeButton}
                    disabled={
                        formActive ||
                        excludeRequired ||
                        (includeRequired && !recommendFields)
                    }
                    onClick={() => {
                        const singleValue =
                            selection?.mode !== 'include' || includeRequired
                                ? 'include'
                                : null;

                        const selectionType = evaluateSelectionType(
                            recommendFields[bindingUUID],
                            'include',
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
                    coloredDefaultState={coloredExcludeButton}
                    disabled={
                        formActive ||
                        includeRequired ||
                        (excludeRequired && !recommendFields)
                    }
                    onClick={() => {
                        const singleValue =
                            selection?.mode !== 'exclude' || excludeRequired
                                ? 'exclude'
                                : null;

                        const selectionType = evaluateSelectionType(
                            recommendFields[bindingUUID],
                            'exclude',
                            selection?.mode ?? null,
                            singleValue
                        );

                        setSingleSelection(bindingUUID, field, selectionType);
                    }}
                />
            </ToggleButtonGroup>
        </TableCell>
    );
}

export default FieldActions;
