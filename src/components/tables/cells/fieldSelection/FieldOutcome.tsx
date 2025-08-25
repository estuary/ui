import type { BaseFieldOutcomeProps } from 'src/components/tables/cells/types';

import { Stack, TableCell } from '@mui/material';

import FieldOutcomeButton from 'src/components/tables/cells/fieldSelection/FieldOutcomeButton';

const FieldOutcome = ({ bindingUUID, outcome }: BaseFieldOutcomeProps) => {
    if (!outcome?.select && !outcome?.reject) {
        return <TableCell />;
    }

    return (
        <TableCell>
            <Stack style={{ alignItems: 'center' }}>
                <FieldOutcomeButton
                    bindingUUID={bindingUUID}
                    outcome={outcome}
                />
            </Stack>
        </TableCell>
    );
};

export default FieldOutcome;
