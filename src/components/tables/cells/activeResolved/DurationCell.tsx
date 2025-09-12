import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import { useMemo } from 'react';

import { chipClasses, TableCell, Tooltip, Typography } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

function DurationCell({ firedAt, resolvedAt }: ActiveOrResolvedCellsProps) {
    const intl = useIntl();

    const [_resolvedOutput, resolvedTooltip, duration] = useMemo(() => {
        if (resolvedAt) {
            const firedAtDate = DateTime.fromISO(firedAt).toUTC();
            const resolvedAtDate = DateTime.fromISO(resolvedAt).toUTC();

            const sameDay = firedAtDate.hasSame(resolvedAtDate, 'day');

            const foo = resolvedAtDate.diff(firedAtDate);

            return [
                resolvedAtDate.toLocaleString(
                    sameDay
                        ? DateTime.TIME_WITH_SHORT_OFFSET
                        : DateTime.DATETIME_FULL
                ),
                resolvedAt,
                foo,
            ];
        }

        return [
            intl.formatMessage({ id: 'data.active' }),
            // TODO (alert history) - need to get this content made
            intl.formatMessage({ id: 'data.alert is still active' }),
            null,
        ];
    }, [firedAt, intl, resolvedAt]);

    console.log('duration', duration);

    return (
        <TableCell
            sx={{
                [`& .${chipClasses.label}`]: {
                    whiteSpace: 'nowrap !important',
                },
            }}
        >
            <Tooltip title={resolvedTooltip} placement="top-end">
                <Typography>
                    {duration
                        ? duration
                              .shiftTo(
                                  'months',
                                  'days',
                                  'hours',
                                  'minutes',
                                  'seconds'
                              )
                              .toHuman()
                        : intl.formatMessage({ id: 'data.active' })}
                </Typography>
            </Tooltip>
        </TableCell>
    );
}

export default DurationCell;
