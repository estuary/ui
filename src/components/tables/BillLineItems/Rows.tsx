import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/BillLineItems/types';

import { Stack, TableCell, TableRow, Tooltip, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

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
    const intl = useIntl();

    return (
        <>
            {lineItems.map((record, index) => (
                <Row
                    row={record}
                    key={index}
                    descriptionTooltip={
                        record.description.includes('Task usage') ? (
                            <Tooltip
                                placement="right"
                                title={intl.formatMessage({
                                    id: 'admin.billing.label.lineItems.tooltip.message',
                                })}
                            >
                                <HelpCircle style={{ fontSize: 11 }} />
                            </Tooltip>
                        ) : null
                    }
                />
            ))}
        </>
    );
}

export default Rows;
