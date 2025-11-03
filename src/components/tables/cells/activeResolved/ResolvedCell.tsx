import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import { useMemo } from 'react';

import { TableCell, Tooltip } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import TimeStamp from 'src/components/tables/cells/activeResolved/TimeStamp';
import { toAbsHumanDuration } from 'src/services/luxon';

function ResolvedCell({ firedAt, resolvedAt }: ActiveOrResolvedCellsProps) {
    const intl = useIntl();

    const [outputDate, outputTime, tooltipTitle] = useMemo(() => {
        if (resolvedAt) {
            const firedAtDate = DateTime.fromISO(firedAt).toUTC();
            const resolvedAtDate = DateTime.fromISO(resolvedAt).toUTC();

            return [
                resolvedAtDate.toLocaleString(DateTime.DATE_FULL),
                resolvedAtDate.toLocaleString(DateTime.TIME_WITH_SECONDS),
                intl.formatMessage(
                    { id: 'alerts.table.resolvedAt.tooltip' },
                    {
                        alertDuration: toAbsHumanDuration(
                            resolvedAtDate,
                            firedAtDate
                        ),
                    }
                ),
            ];
        }

        return [null, null, null];
    }, [firedAt, intl, resolvedAt]);

    return (
        <TableCell>
            {outputDate === null ? null : (
                <Tooltip title={tooltipTitle} placement="top-end">
                    <span>
                        <TimeStamp
                            outputDate={outputDate}
                            outputTime={outputTime}
                        />
                    </span>
                </Tooltip>
            )}
        </TableCell>
    );
}

export default ResolvedCell;
