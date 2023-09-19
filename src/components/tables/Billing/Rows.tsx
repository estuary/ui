import { TableCell, TableRow, Typography } from '@mui/material';
import { BillingRecord } from 'api/billing';
import MonetaryValue from 'components/tables/cells/MonetaryValue';
import DataVolume from 'components/tables/cells/billing/DataVolume';
import TimeStamp from 'components/tables/cells/billing/TimeStamp';
import { NavArrowRight } from 'iconoir-react';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBilling_setSelectedMonth } from 'stores/Billing/hooks';

interface RowProps {
    row: BillingRecord;
    isSelected: boolean;
}

interface RowsProps {
    data: BillingRecord[];
    selectedMonth: string;
}

function Row({ row, isSelected }: RowProps) {
    const setSelectedMonth = useBilling_setSelectedMonth();
    return (
        <TableRow
            hover
            selected={isSelected}
            onClick={() => setSelectedMonth(row.billed_month)}
            sx={{ cursor: 'pointer' }}
        >
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
            <TableCell>
                <NavArrowRight style={{ verticalAlign: 'middle' }} />
            </TableCell>
        </TableRow>
    );
}

// TODO (billing): Remove pagination placeholder when the new RPC is available.
function Rows({ data, selectedMonth }: RowsProps) {
    // The table should only show the four, most recent months of billing history.
    // If the user has accrued more than four months worth of billing data, calculate
    // the adjusted start index.
    const startIndex = useMemo(
        () => (data.length > 4 ? data.length - 4 : 0),
        [data.length]
    );

    return (
        <>
            {data
                .slice(startIndex, data.length)
                .reverse()
                .map((record, index) => (
                    <Row
                        row={record}
                        key={index}
                        isSelected={record.billed_month === selectedMonth}
                    />
                ))}
        </>
    );
}

export default Rows;
