import { TableCell, TableRow } from '@mui/material';
import { orderBy } from 'lodash';
import ControllerErrors from '../cells/entityStatus/ControllerErrors';
import ControllerStatus from '../cells/entityStatus/ControllerStatus';
import TimeStamp from '../cells/TimeStamp';
import type { RowProps, RowsProps } from './types';

function Row({ row }: RowProps) {
    return (
        <TableRow>
            {row.detail ? (
                <ControllerStatus detail={row.detail} status={row.result} />
            ) : (
                <TableCell />
            )}

            {row.created ? (
                <TimeStamp enableExact time={row.created} />
            ) : (
                <TableCell />
            )}

            {row.completed ? (
                <TimeStamp enableExact time={row.completed} />
            ) : (
                <TableCell />
            )}

            <ControllerErrors
                errors={row.errors ? row.errors : []}
                popperPlacement="bottom-start"
            />
        </TableRow>
    );
}

export default function Rows({ columnToSort, data, sortDirection }: RowsProps) {
    return (
        <>
            {orderBy(data, [columnToSort], [sortDirection]).map(
                (datum, index) => (
                    <Row
                        key={`controller-status-history-table-rows-${index}`}
                        row={datum}
                    />
                )
            )}
        </>
    );
}
