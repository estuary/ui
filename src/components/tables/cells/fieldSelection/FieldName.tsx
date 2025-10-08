import type { FieldNameProps } from 'src/components/tables/cells/types';

import { Stack, TableCell, Typography } from '@mui/material';

import { wrappingTableBodyCell } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import {
    hasFieldConflict,
    isSelectedField,
} from 'src/utils/fieldSelection-utils';

const FieldName = ({ field, outcome }: FieldNameProps) => {
    return (
        <TableCell sx={wrappingTableBodyCell}>
            <OutlinedChip
                color={hasFieldConflict(outcome) ? 'error' : undefined}
                label={
                    <Stack
                        direction="row"
                        spacing={1}
                        style={{ alignItems: 'center' }}
                    >
                        <Typography>{field}</Typography>
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
