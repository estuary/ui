import { TableCell, TableRow, Typography } from '@mui/material';
import MonetaryValue from 'components/tables/cells/MonetaryValue';
import Bytes from 'components/tables/cells/stats/Bytes';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { FormattedMessage } from 'react-intl';
import { BillingRecord } from 'stores/Billing/types';

interface RowProps {
    row: BillingRecord;
}

interface RowsProps {
    data: BillingRecord[];
}

// TODO: Determine if the details table column is necessary and, if so,
//   what data should be displayed in that column. My proposition is that
//   the tier evaluation for that month should be identified in that column.
function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TimeStamp time={row.date} monthOnly={true} />

            <Bytes
                val={row.dataVolume}
                messageId="admin.billing.table.history.tooltip.dataVolume"
            />

            <TableCell>
                <Typography>{row.taskCount}</Typography>
            </TableCell>

            <TableCell>
                <Typography>
                    <FormattedMessage
                        id={`admin.billing.tier.${row.pricingTier}`}
                    />
                </Typography>
            </TableCell>

            <MonetaryValue amount={row.totalCost} />
        </TableRow>
    );
}

// TODO (billing): Remove pagination placeholder when the new RPC is available.
function Rows({ data }: RowsProps) {
    return (
        <>
            {data.slice(0, 4).map((record, index) => (
                <Row row={record} key={index} />
            ))}
        </>
    );
}

export default Rows;
