import { TableCell, ToggleButtonGroup } from '@mui/material';
import {
    ConstraintTypes,
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import { useBindingsEditorStore_setSingleSelection } from 'components/editor/Bindings/Store/hooks';
import FieldActionButton from 'components/tables/cells/fieldSelection/FieldActionButton';
import { useMemo } from 'react';
import {
    useBinding_recommendFields,
    useBinding_selections,
} from 'stores/Binding/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    evaluateRecommendedIncludedFields,
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
    const setSingleSelection = useBindingsEditorStore_setSingleSelection();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    const selectedValue = useMemo(
        () => selections[bindingUUID][field],
        [bindingUUID, field, selections]
    );

    const includeRequired = evaluateRequiredIncludedFields(constraint.type);
    const includeRecommended = evaluateRecommendedIncludedFields(
        constraint.type
    );

    const coloredIncludeButton =
        selectedValue === 'default' && includeRecommended;

    const coloredExcludeButton =
        selectedValue === 'default' && !includeRecommended;

    if (constraint.type === ConstraintTypes.UNSATISFIABLE) {
        return null;
    }

    return (
        <TableCell>
            <ToggleButtonGroup
                size="small"
                exclusive
                sx={{
                    '& .MuiToggleButton-root': {
                        '&:not(:first-of-type), &:not(:last-of-type)': {
                            borderRadius: 0,
                        },
                        '&:first-of-type': {
                            borderTopLeftRadius: 4,
                            borderBottomLeftRadius: 4,
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                        },
                        '&:last-of-type': {
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderTopRightRadius: 4,
                            borderBottomRightRadius: 4,
                        },
                    },
                }}
            >
                <FieldActionButton
                    messageId="fieldSelection.table.cta.includeField"
                    selectedValue={selectedValue}
                    value="include"
                    coloredDefaultState={coloredIncludeButton}
                    disabled={
                        formActive || (includeRequired && !recommendFields)
                    }
                    onClick={() => {
                        const singleValue =
                            selectedValue !== 'include' || includeRequired
                                ? 'include'
                                : null;

                        const selectionType = evaluateSelectionType(
                            recommendFields[bindingUUID],
                            'include',
                            selectedValue,
                            singleValue
                        );

                        setSingleSelection(field, selectionType);
                    }}
                />

                <FieldActionButton
                    messageId="fieldSelection.table.cta.excludeField"
                    selectedValue={selectedValue}
                    value="exclude"
                    coloredDefaultState={coloredExcludeButton}
                    disabled={includeRequired || formActive}
                    onClick={() => {
                        const singleValue =
                            selectedValue !== 'exclude' ? 'exclude' : null;

                        const selectionType = evaluateSelectionType(
                            recommendFields[bindingUUID],
                            'exclude',
                            selectedValue,
                            singleValue
                        );

                        setSingleSelection(field, selectionType);
                    }}
                />
            </ToggleButtonGroup>
        </TableCell>
    );
}

export default FieldActions;
