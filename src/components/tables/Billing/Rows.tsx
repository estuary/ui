import { TableCell, TableRow } from '@mui/material';
import DataVolume from 'components/tables/cells/billing/DataVolume';
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
                <span>{row.taskCount}</span>
            </TableCell>

            <TableCell>
                <span>Filler</span>
            </TableCell>

            <TableCell>
                <span>{row.totalCost}</span>
            </TableCell>
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
