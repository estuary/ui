import { SyntheticEvent, useCallback, useMemo } from 'react';

import { Box, Stack, TableCell, ToggleButtonProps } from '@mui/material';

import {
    ConstraintTypes,
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import {
    useBindingsEditorStore_recommendFields,
    useBindingsEditorStore_selections,
    useBindingsEditorStore_setSingleSelection,
} from 'components/editor/Bindings/Store/hooks';
import CustomSelectionOptions from 'components/tables/cells/fieldSelection/CustomSelectionOptions';
import OutlinedToggleButton from 'components/tables/cells/fieldSelection/OutlinedToggleButton';

interface Props {
    field: string;
    constraint: TranslatedConstraint;
    selectionType: FieldSelectionType | null;
}

function FieldActions({ field, constraint }: Props) {
    const recommendFields = useBindingsEditorStore_recommendFields();

    // const selectionSaving = useBindingsEditorStore_selectionSaving();
    const selections = useBindingsEditorStore_selections();
    const setSingleSelection = useBindingsEditorStore_setSingleSelection();

    // TODO (field selection): Determine whether the included/excluded toggle button group should be disabled
    //   when the default option is selected.
    // const [toggleDisabled, setToggleDisabled] = useState(true);

    const selectedValue = useMemo(() => selections[field], [field, selections]);

    const updateFieldSelection: ToggleButtonProps['onChange'] = useCallback(
        (event: SyntheticEvent) => {
            event.preventDefault();
            event.stopPropagation();

            if (selectedValue === 'default') {
                const includeRecommended =
                    constraint.type === ConstraintTypes.FIELD_REQUIRED ||
                    constraint.type === ConstraintTypes.LOCATION_REQUIRED ||
                    constraint.type === ConstraintTypes.LOCATION_RECOMMENDED;

                setSingleSelection(
                    field,
                    includeRecommended ? 'include' : 'exclude'
                );
            } else {
                setSingleSelection(field, 'default');
            }

            // setToggleDisabled(!toggleDisabled);
        },
        [setSingleSelection, constraint.type, field, selectedValue]
    );

    return (
        <TableCell>
            <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                <Box>
                    <OutlinedToggleButton
                        messageId="fieldSelection.table.cta.defaultField"
                        selectedValue={selectedValue}
                        value="default"
                        disabled={!recommendFields}
                        onChange={updateFieldSelection}
                    />
                </Box>

                <CustomSelectionOptions field={field} constraint={constraint} />
            </Stack>
        </TableCell>
    );
}

export default FieldActions;
