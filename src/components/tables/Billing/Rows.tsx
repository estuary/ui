import { TableCell, TableRow, Typography } from '@mui/material';
import TimeStamp from 'components/tables/cells/billing/TimeStamp';
import MonetaryValue from 'components/tables/cells/MonetaryValue';
import Bytes from 'components/tables/cells/stats/Bytes';
import { FormattedMessage } from 'react-intl';
import { FormattedBillingRecord } from 'stores/Billing/types';

interface RowProps {
    row: FormattedBillingRecord;
}

interface RowsProps {
    data: FormattedBillingRecord[];
}

// TODO: Determine if the details table column is necessary and, if so,
//   what data should be displayed in that column. My proposition is that
//   the tier evaluation for that month should be identified in that column.
function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TimeStamp date={row.date} timestamp={row.timestamp} />

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
