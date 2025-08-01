import type { BaseFieldOutcomeProps } from 'src/components/tables/cells/types';

import { Stack, TableCell } from '@mui/material';

import FieldOutcomeButton from 'src/components/tables/cells/fieldSelection/FieldOutcomeButton';

const FieldOutcome = ({ outcome }: BaseFieldOutcomeProps) => {
    if (!outcome?.select && !outcome?.reject) {
        return <TableCell />;
    }

    return (
        <TableCell>
            <Stack style={{ alignItems: 'center' }}>
                <FieldOutcomeButton outcome={outcome} />
            </Stack>
        </TableCell>
    );
};

export default FieldOutcome;
