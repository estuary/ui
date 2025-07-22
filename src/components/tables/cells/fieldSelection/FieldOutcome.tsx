import type { FieldOutcomeProps } from 'src/components/tables/cells/types';

import { TableCell } from '@mui/material';

import FieldOutput from 'src/components/tables/cells/fieldSelection/FieldOutput';
import { RejectReason } from 'src/types/wasm';
import {
    hasFieldConflict,
    isSelectedField,
    isUnselectedField,
} from 'src/utils/fieldSelection-utils';

const FieldOutcome = ({ outcome, selectionType }: FieldOutcomeProps) => {
    const conflictExists = hasFieldConflict(outcome);

    const output =
        (conflictExists &&
            (selectionType === 'exclude' ||
                outcome?.reject?.reason === RejectReason.NOT_SELECTED)) ||
        isUnselectedField(outcome)
            ? outcome?.reject
            : conflictExists || isSelectedField(outcome)
              ? outcome.select
              : undefined;

    if ((!outcome?.select && !outcome?.reject) || !output) {
        return <TableCell />;
    }

    return (
        <TableCell
            sx={{
                minWidth: 275,
            }}
        >
            <FieldOutput
                indicateConflict={conflictExists}
                output={output}
                outcome={outcome}
            />
        </TableCell>
    );
};

export default FieldOutcome;
