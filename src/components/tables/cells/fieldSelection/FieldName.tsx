import type { FieldNameProps } from 'src/components/tables/cells/types';

import { Stack, TableCell, Typography } from '@mui/material';

import { wrappingTableBodyCell } from 'src/context/Theme';
import { useBindingStore } from 'src/stores/Binding/Store';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import {
    hasFieldConflict,
    isSelectedField,
} from 'src/utils/fieldSelection-utils';

const FieldName = ({ bindingUUID, field, outcome }: FieldNameProps) => {
    const isGroupByKey = useBindingStore((state) =>
        bindingUUID && state.selections?.[bindingUUID]
            ? state.selections[bindingUUID].groupBy.explicit.includes(field) ||
              state.selections[bindingUUID].groupBy.implicit.includes(field)
            : false
    );

    return (
        <TableCell sx={wrappingTableBodyCell}>
            <OutlinedChip
                color={
                    hasFieldConflict(outcome)
                        ? 'error'
                        : isGroupByKey
                          ? 'primary'
                          : undefined
                }
                label={
                    <Stack
                        direction="row"
                        spacing={1}
                        style={{ alignItems: 'center' }}
                    >
                        <Typography
                            style={{ fontWeight: isGroupByKey ? 500 : 400 }}
                        >
                            {field}
                        </Typography>
                    </Stack>
                }
                variant="outlined"
                diminishedText={Boolean(
                    !isSelectedField(outcome) && !hasFieldConflict(outcome)
                )}
            />
        </TableCell>
    );
};

export default FieldName;
