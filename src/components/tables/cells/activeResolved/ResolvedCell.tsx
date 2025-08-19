import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import { useMemo } from 'react';

import { chipClasses, TableCell, Tooltip } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function ResolvedCell({ firedAt, resolvedAt }: ActiveOrResolvedCellsProps) {
    const intl = useIntl();

    const [resolvedOutput, resolvedTooltip] = useMemo(() => {
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
            intl.formatMessage({ id: 'data.alert is still active' }),
            null,
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
                <OutlinedChip
                    component="span"
                    color={'error'}
                    label={resolvedOutput ? resolvedOutput : 'active'}
                    size="small"
                    variant="outlined"
                />
            </Tooltip>
        </TableCell>
    );
}

export default ResolvedCell;
