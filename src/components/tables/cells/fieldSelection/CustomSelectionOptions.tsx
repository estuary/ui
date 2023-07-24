import { Box, ToggleButtonGroup } from '@mui/material';
import {
    ConstraintTypes,
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import { useBindingsEditorStore_recommendFields } from 'components/editor/Bindings/Store/hooks';
import OutlinedToggleButton from 'components/tables/cells/fieldSelection/OutlinedToggleButton';
import { Dispatch, SetStateAction } from 'react';

interface Props {
    constraint: TranslatedConstraint;
    selectedValue: FieldSelectionType | null;
    setSelectedValue: Dispatch<SetStateAction<FieldSelectionType | null>>;
}

// TODO (field selection): Determine whether the included/excluded toggle button group should be disabled
//   when the default option is selected.
function CustomSelectionOptions({
    constraint,
    selectedValue,
    setSelectedValue,
}: Props) {
    const recommendFields = useBindingsEditorStore_recommendFields();

    if (constraint.type === ConstraintTypes.UNSATISFIABLE) {
        return null;
    } else {
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

                            setSelectedValue(
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
                            constraint.type ===
                                ConstraintTypes.FIELD_REQUIRED ||
                            constraint.type ===
                                ConstraintTypes.LOCATION_REQUIRED
                        }
                        onClick={() => {
                            const singleValue =
                                selectedValue !== 'exclude' ? 'exclude' : null;

                            setSelectedValue(
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
}

export default CustomSelectionOptions;
