import { TableCell, TableRow, Typography } from '@mui/material';
import { BillingRecord } from 'api/billing';
import DataVolume from 'components/tables/cells/billing/DataVolume';
import TimeStamp from 'components/tables/cells/billing/TimeStamp';
import MonetaryValue from 'components/tables/cells/MonetaryValue';
import { FormattedMessage } from 'react-intl';

interface RowProps {
    row: BillingRecord;
}

interface RowsProps {
    data: BillingRecord[];
}

// TODO: Determine if it is intentional for max concurrent tasks to be zero when
//   the billing_report RPC clearly reports a data volume surplus. Falling back on the
//   tracked included task count in the interim.
function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TimeStamp date={row.billed_month} />

            <DataVolume volumeInGB={row.total_processed_data_gb} />

            <TableCell>
                <Typography>
                    {row.max_concurrent_tasks > 0
                        ? row.max_concurrent_tasks
                        : row.line_items[0].count}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography>
                    <FormattedMessage id="admin.billing.tier.personal" />
                </Typography>
            </TableCell>

            <MonetaryValue amount={row.subtotal / 100} />
        </TableRow>
    );
}

// TODO (billing): Remove pagination placeholder when the new RPC is available.
function Rows({ data }: RowsProps) {
    return (
        <>
            {data
                .slice(data.length - 4, data.length)
                .reverse()
                .map((record, index) => (
                    <Row row={record} key={index} />
                ))}
        </>
    );
}

export default Rows;
