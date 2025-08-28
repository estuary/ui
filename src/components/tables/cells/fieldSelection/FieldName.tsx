import type { FieldNameProps } from 'src/components/tables/cells/types';

import { TableCell } from '@mui/material';

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
                label={field}
                variant="outlined"
                diminishedText={Boolean(
                    !isSelectedField(outcome) && !hasFieldConflict(outcome)
                )}
            />
        </TableCell>
    );
};

export default FieldName;
