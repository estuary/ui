import { Box, Stack, TableCell } from '@mui/material';
import {
    ConstraintTypes,
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import { useBindingsEditorStore_recommendFields } from 'components/editor/Bindings/Store/hooks';
import CustomSelectionOptions from 'components/tables/cells/fieldSelection/CustomSelectionOptions';
import OutlinedToggleButton from 'components/tables/cells/fieldSelection/OutlinedToggleButton';
import { useState } from 'react';
import { useUpdateEffect } from 'react-use';

interface Props {
    constraint: TranslatedConstraint;
    selectionType: FieldSelectionType;
}

function FieldActions({ constraint, selectionType }: Props) {
    const recommendFields = useBindingsEditorStore_recommendFields();

    const [selectedValue, setSelectedValue] =
        useState<FieldSelectionType | null>(selectionType);

    // TODO (field selection): Determine whether the included/excluded toggle button group should be disabled
    //   when the default option is selected.
    // const [toggleDisabled, setToggleDisabled] = useState(true);

    useUpdateEffect(() => {
        if (!recommendFields) {
            const includeRequired =
                constraint.type === ConstraintTypes.FIELD_REQUIRED ||
                constraint.type === ConstraintTypes.LOCATION_REQUIRED;

            setSelectedValue(includeRequired ? 'include' : null);
        } else {
            setSelectedValue('default');
        }
    }, [setSelectedValue, constraint.type, recommendFields]);

    return (
        <TableCell>
            <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                <Box>
                    <OutlinedToggleButton
                        messageId="fieldSelection.table.cta.defaultField"
                        selectedValue={selectedValue}
                        value="default"
                        disabled={!recommendFields}
                        onClick={() => {
                            if (selectedValue === 'default') {
                                const includeRecommended =
                                    constraint.type ===
                                        ConstraintTypes.FIELD_REQUIRED ||
                                    constraint.type ===
                                        ConstraintTypes.LOCATION_REQUIRED ||
                                    constraint.type ===
                                        ConstraintTypes.LOCATION_RECOMMENDED;

                                setSelectedValue(
                                    includeRecommended ? 'include' : 'exclude'
                                );
                            } else {
                                setSelectedValue('default');
                            }

                            // setToggleDisabled(!toggleDisabled);
                        }}
                    />
                </Box>

                <CustomSelectionOptions
                    constraint={constraint}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                />
            </Stack>
        </TableCell>
    );
}

export default FieldActions;
