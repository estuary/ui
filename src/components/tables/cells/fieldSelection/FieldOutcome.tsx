import type { FieldOutcomeProps } from 'src/components/tables/cells/types';

import { TableCell, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { fieldOutcomeMessages } from 'src/components/tables/cells/fieldSelection/shared';
import { RejectReason } from 'src/types/wasm';
import {
    hasFieldConflict,
    isSelectedField,
    isUnselectedField,
} from 'src/utils/fieldSelection-utils';

const FieldOutcome = ({ outcome, selectionType }: FieldOutcomeProps) => {
    const intl = useIntl();

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

    const titleId =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        fieldOutcomeMessages[output?.reason]?.id ??
        'fieldSelection.table.label.unknown';

    return (
        <TableCell
            sx={{
                minWidth: 275,
            }}
        >
            <Typography
                sx={{
                    color: conflictExists
                        ? (theme) =>
                              theme.palette.mode === 'light'
                                  ? theme.palette.warning.dark
                                  : theme.palette.warning.main
                        : undefined,
                    fontWeight: 500,
                }}
            >
                {intl.formatMessage({ id: titleId })}
            </Typography>

            <Typography>
                {output.detail.charAt(0).toUpperCase() + output.detail.slice(1)}
            </Typography>
        </TableCell>
    );
};

export default FieldOutcome;
