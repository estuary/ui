import type { FieldNameProps } from 'src/components/tables/cells/types';

import { Stack, TableCell, Typography } from '@mui/material';

import FieldConflictButton from 'src/components/tables/cells/fieldSelection/FieldConflictButton';
import { getStickyTableCell } from 'src/context/Theme';

const FieldName = ({ field, outcome }: FieldNameProps) => {
    return (
        <TableCell sx={getStickyTableCell()}>
            <Stack direction="row" style={{ alignItems: 'center' }}>
                <Typography style={{ marginRight: 4 }}>{field}</Typography>

                <FieldConflictButton outcome={outcome} />
            </Stack>
        </TableCell>
    );
};

export default FieldName;
