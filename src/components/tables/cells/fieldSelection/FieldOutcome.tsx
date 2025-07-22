import type { FieldOutcomeProps } from 'src/components/tables/cells/types';

import { TableCell, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { fieldOutcomeMessages } from 'src/components/tables/cells/fieldSelection/shared';

const FieldOutcome = ({ outcome, selectionType }: FieldOutcomeProps) => {
    const intl = useIntl();

    const singleOutcome = outcome?.select ? outcome.select : outcome?.reject;

    if ((!outcome?.select && !outcome?.reject) || !singleOutcome) {
        return <TableCell />;
    }

    const output =
        outcome?.select && outcome?.reject && selectionType === 'exclude'
            ? outcome.reject
            : outcome?.select && outcome?.reject
              ? outcome.select
              : singleOutcome;

    const titleId =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        fieldOutcomeMessages[output.reason]?.id ??
        'fieldSelection.table.label.unknown';

    return (
        <TableCell
            sx={{
                minWidth: 275,
            }}
        >
            <Typography
                sx={{
                    color:
                        outcome?.select && outcome?.reject
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
