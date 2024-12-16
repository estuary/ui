import { TableCell, TableRow } from '@mui/material';
import { orderBy } from 'lodash';
import ControllerErrors from '../cells/ControllerErrors';
import ControllerStatus from '../cells/ControllerStatus';
import TimeStamp from '../cells/TimeStamp';
import { RowProps, RowsProps } from './types';

function Row({ row }: RowProps) {
    return (
        <TableRow>
            {row.detail ? (
                <TableCell>
                    <ControllerStatus detail={row.detail} status={row.result} />
                </TableCell>
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

            <TableCell>
                <ControllerErrors
                    errors={row.errors ? row.errors : []}
                    popperPlacement="bottom-start"
                />
            </TableCell>
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
