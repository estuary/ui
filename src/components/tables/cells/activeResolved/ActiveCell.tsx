import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import { useMemo } from 'react';

import { TableCell, Tooltip } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import TimeStamp from 'src/components/tables/cells/activeResolved/TimeStamp';

function ActiveCell({ firedAt }: ActiveOrResolvedCellsProps) {
    const intl = useIntl();

    const [outputDate, outputTime, tooltipTitle] = useMemo(() => {
        const firedAtDate = DateTime.fromISO(firedAt).toUTC();

        return [
            firedAtDate.toLocaleString(DateTime.DATE_FULL),
            firedAtDate.toLocaleString({
                ...DateTime.TIME_WITH_SECONDS,
                timeZoneName: 'short',
            }),
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
                <span>
                    <TimeStamp
                        outputDate={outputDate}
                        outputTime={outputTime}
                    />
                </span>
            </Tooltip>
        </TableCell>
    );
}

export default ActiveCell;
