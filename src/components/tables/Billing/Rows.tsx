import { TableCell, TableRow, Typography } from '@mui/material';
import { BillingRecord } from 'api/billing';
import DataVolume from 'components/tables/cells/billing/DataVolume';
import TimeStamp from 'components/tables/cells/billing/TimeStamp';
import MonetaryValue from 'components/tables/cells/MonetaryValue';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

interface RowProps {
    row: BillingRecord;
}

interface RowsProps {
    data: BillingRecord[];
}

function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TimeStamp date={row.billed_month} />

            <DataVolume volumeInGB={row.processed_data_gb ?? 0} />

            <TableCell>
                <Typography>
                    <FormattedMessage
                        id="admin.billing.graph.taskHoursByMonth.formatValue"
                        values={{ taskUsage: row.task_usage_hours }}
                    />
                </Typography>
            </TableCell>

            <MonetaryValue amount={row.subtotal / 100} />
        </TableRow>
    );
}

// TODO (billing): Remove pagination placeholder when the new RPC is available.
function Rows({ data }: RowsProps) {
    // The table should only show the four, most recent months of billing history.
    // If the user has accrued more than four months worth of billing data, truncate
    // the data.
    const processedData = useMemo(
        () =>
            data.length > 4 ? data.slice(data.length - 4, data.length) : data,
        [data]
    );

    return (
        <>
            {[...processedData].reverse().map((record, index) => (
                <Row row={record} key={index} />
            ))}
        </>
    );
}

export default Rows;
