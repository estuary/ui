import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import { useMemo } from 'react';

import { Stack, TableCell, Tooltip, Typography } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

function ActiveCell({ firedAt }: ActiveOrResolvedCellsProps) {
    const intl = useIntl();

    const [outputDate, outputTime, tooltipTitle] = useMemo(() => {
        const firedAtDate = DateTime.fromISO(firedAt).toUTC();

        return [
            firedAtDate.toLocaleString(DateTime.DATE_FULL),
            firedAtDate.toLocaleString(DateTime.TIME_WITH_SECONDS),
            intl.formatMessage(
                { id: 'alerts.table.firedAt.tooltip' },
                {
                    relative: firedAtDate.toRelative(),
                }
            ),
        ];
    }, [firedAt, intl]);

    return (
        <TableCell>
            <Tooltip title={tooltipTitle} placement="top-end">
                <Stack>
                    <Typography component="span" variant="subtitle2">
                        {outputDate}
                    </Typography>
                    <Typography component="span">{outputTime}</Typography>
                </Stack>
            </Tooltip>
        </TableCell>
    );
}

export default ActiveCell;
