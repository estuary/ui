import type { FieldNameProps } from 'src/components/tables/cells/types';

import { Stack, TableCell } from '@mui/material';

import { getStickyTableCell } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import {
    hasFieldConflict,
    isSelectedField,
} from 'src/utils/fieldSelection-utils';

const FieldName = ({ field, outcome }: FieldNameProps) => {
    return (
        <TableCell sx={getStickyTableCell()}>
            <Stack direction="row" style={{ alignItems: 'center' }}>
                {/* {hasFieldConflict(outcome) ? ( */}
                {/* <FieldConflictButton outcome={outcome} /> */}
                {/* ) : null} */}

                <OutlinedChip
                    color={hasFieldConflict(outcome) ? 'error' : undefined}
                    label={field}
                    variant="outlined"
                    diminishedText={Boolean(
                        !isSelectedField(outcome) && !hasFieldConflict(outcome)
                    )}
                />
                {/* <Typography style={{ marginLeft: 4 }}>{field}</Typography> */}
            </Stack>
        </TableCell>
    );
};

export default FieldName;
