import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/BillLineItems/types';

import { Stack, TableCell, TableRow, Typography } from '@mui/material';

import TaskExplination from 'src/components/tables/BillLineItems/TaskExplination';
import MonetaryValue from 'src/components/tables/cells/MonetaryValue';

function Row({ row, descriptionTooltip }: RowProps) {
    return (
        <TableRow hover>
            <TableCell>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <Typography>{row.description}</Typography>
                    {descriptionTooltip}
                </Stack>
            </TableCell>
            <TableCell>
                <Typography>{row.count}</Typography>
            </TableCell>

            <MonetaryValue amount={row.rate} />
            <MonetaryValue amount={row.subtotal} />
        </TableRow>
    );
}

function Rows({ lineItems }: RowsProps) {
    return (
        <>
            {lineItems.map((record, index) => (
                <Row
                    row={record}
                    key={index}
                    descriptionTooltip={
                        record.description.includes('Task usage') ? (
                            <TaskExplination />
                        ) : null
                    }
                />
            ))}
        </>
    );
}

export default Rows;
