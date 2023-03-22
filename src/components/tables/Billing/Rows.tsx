import { TableCell, TableRow, Typography } from '@mui/material';
import DataVolume from 'components/tables/cells/billing/DataVolume';
import MonetaryValue from 'components/tables/cells/billing/MonetaryValue';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { useBilling_billingDetails } from 'stores/Tables/Billing/hooks';
import { BillingDetails } from 'stores/Tables/Billing/types';

interface RowProps {
    row: BillingDetails;
}

function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TimeStamp time={row.date} monthOnly={true} />

            <DataVolume val={row.dataVolume} />

            <TableCell>
                <Typography>{row.taskCount}</Typography>
            </TableCell>

            <TableCell>
                <Typography>Filler</Typography>
            </TableCell>

            <MonetaryValue amount={row.totalCost} />
        </TableRow>
    );
}

function Rows() {
    const billingDetails = useBilling_billingDetails();

    return (
        <>
            {Object.entries(billingDetails).map(([date, row]) => (
                <Row row={row} key={date} />
            ))}
        </>
    );
}

export default Rows;
