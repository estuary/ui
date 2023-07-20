import { Box, Stack, TableCell } from '@mui/material';
import {
    ConstraintTypes,
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import CustomSelectionOptions from 'components/tables/cells/fieldSelection/CustomSelectionOptions';
import OutlinedToggleButton from 'components/tables/cells/fieldSelection/OutlinedToggleButton';
import { useState } from 'react';

interface Props {
    constraint: TranslatedConstraint;
}

function FieldActions({ constraint }: Props) {
    const [selectedValue, setSelectedValue] =
        useState<FieldSelectionType>('default');

    // TODO (field selection): Determine whether the included/excluded toggle button group should be disabled
    //   when the default option is selected.
    // const [toggleDisabled, setToggleDisabled] = useState(true);

    return (
        <TableCell>
            <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                <Box>
                    <OutlinedToggleButton
                        messageId="fieldSelection.table.cta.defaultField"
                        selectedValue={selectedValue}
                        value="default"
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
