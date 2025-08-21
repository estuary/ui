import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import { useMemo } from 'react';

import { chipClasses, TableCell, Tooltip, Typography } from '@mui/material';

import { DateTime } from 'luxon';

function ActiveCell({ firedAt }: ActiveOrResolvedCellsProps) {
    const [firedOutput, firedTooltip] = useMemo(() => {
        const firedAtDate = DateTime.fromISO(firedAt).toUTC();

        return [firedAtDate.toLocaleString(DateTime.DATETIME_FULL), firedAt];
    }, [firedAt]);

    return (
        <TableCell
            sx={{
                [`& .${chipClasses.label}`]: {
                    whiteSpace: 'nowrap !important',
                },
            }}
        >
            <Tooltip title={firedTooltip} placement="top-end">
                <Typography component="span">{firedOutput}</Typography>
            </Tooltip>
        </TableCell>
    );
}

export default ActiveCell;
