import { Box, ToggleButtonGroup } from '@mui/material';
import {
    ConstraintTypes,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import {
    useBindingsEditorStore_recommendFields,
    useBindingsEditorStore_selections,
    useBindingsEditorStore_setSingleSelection,
} from 'components/editor/Bindings/Store/hooks';
import OutlinedToggleButton from 'components/tables/cells/fieldSelection/OutlinedToggleButton';
import { useMemo } from 'react';

interface Props {
    field: string;
    constraint: TranslatedConstraint;
}

// TODO (field selection): Determine whether the included/excluded toggle button group should be disabled
//   when the default option is selected.
function CustomSelectionOptions({ constraint, field }: Props) {
    const recommendFields = useBindingsEditorStore_recommendFields();
    const selections = useBindingsEditorStore_selections();
    const setSingleSelection = useBindingsEditorStore_setSingleSelection();

    const selectedValue = useMemo(() => selections[field], [field, selections]);

    if (constraint.type === ConstraintTypes.UNSATISFIABLE) {
        return null;
    }

    return (
        <Box>
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
                <OutlinedToggleButton
                    messageId="fieldSelection.table.cta.includeField"
                    selectedValue={selectedValue}
                    value="include"
                    onClick={() => {
                        const singleValue =
                            selectedValue !== 'include' ||
                            constraint.type ===
                                ConstraintTypes.FIELD_REQUIRED ||
                            constraint.type ===
                                ConstraintTypes.LOCATION_REQUIRED
                                ? 'include'
                                : null;

                        setSingleSelection(
                            field,
                            selectedValue === 'include' && recommendFields
                                ? 'default'
                                : singleValue
                        );
                    }}
                />

                <OutlinedToggleButton
                    messageId="fieldSelection.table.cta.excludeField"
                    selectedValue={selectedValue}
                    value="exclude"
                    disabled={
                        constraint.type === ConstraintTypes.FIELD_REQUIRED ||
                        constraint.type === ConstraintTypes.LOCATION_REQUIRED
                    }
                    onClick={() => {
                        const singleValue =
                            selectedValue !== 'exclude' ? 'exclude' : null;

                        setSingleSelection(
                            field,
                            selectedValue === 'exclude' && recommendFields
                                ? 'default'
                                : singleValue
                        );
                    }}
                />
            </ToggleButtonGroup>
        </Box>
    );
}

export default CustomSelectionOptions;
