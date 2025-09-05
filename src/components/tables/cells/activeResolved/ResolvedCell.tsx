import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import { useMemo } from 'react';

import { chipClasses, TableCell, Tooltip, Typography } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import { toAbsHumanDuration } from 'src/services/luxon';

function ResolvedCell({ firedAt, resolvedAt }: ActiveOrResolvedCellsProps) {
    const intl = useIntl();

    const [resolvedOutput, resolvedTooltip] = useMemo(() => {
        if (resolvedAt) {
            const firedAtDate = DateTime.fromISO(firedAt).toUTC();
            const resolvedAtDate = DateTime.fromISO(resolvedAt).toUTC();

            return [
                resolvedAtDate.toLocaleString(DateTime.DATETIME_FULL),
                toAbsHumanDuration(resolvedAtDate, firedAtDate),
            ];
        }

        return [
            intl.formatMessage({ id: 'data.active' }),
            intl.formatMessage({ id: 'data.alert is still active' }),
        ];
    }, [firedAt, intl, resolvedAt]);

    return (
        <TableCell
            sx={{
                [`& .${chipClasses.label}`]: {
                    whiteSpace: 'nowrap !important',
                },
            }}
        >
            <Tooltip title={resolvedTooltip} placement="top-end">
                <Typography component="span">
                    {resolvedOutput
                        ? resolvedOutput
                        : intl.formatMessage({ id: 'data.active' })}{' '}
                </Typography>
            </Tooltip>
        </TableCell>
    );
}

export default ResolvedCell;
