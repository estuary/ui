import { TableCell, TableRow, Typography } from '@mui/material';
import DataVolume from 'components/tables/cells/billing/DataVolume';
import MonetaryValue from 'components/tables/cells/billing/MonetaryValue';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { sortBy } from 'lodash';
import { useBilling_billingDetails } from 'stores/Tables/Billing/hooks';
import { BillingDetails } from 'stores/Tables/Billing/types';

interface RowProps {
    row: BillingDetails;
}

// TODO: Determine if the details table column is necessary and, if so,
//   what data should be displayed in that column. My proposition is that
//   the tier evaluation for that month should be identified in that column.
function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TimeStamp time={row.date} monthOnly={true} />

            <DataVolume val={row.dataVolume} />

            <TableCell>
                <Typography>{row.taskCount}</Typography>
            </TableCell>

            {/* <TableCell>
                <Typography>Filler</Typography>
            </TableCell> */}

            <MonetaryValue amount={row.totalCost} />
        </TableRow>
    );
}

function Rows() {
    const billingDetails = useBilling_billingDetails();

    return (
        <>
            {sortBy(billingDetails, 'date')
                .reverse()
                .slice(0, 4)
                .map((detail, index) => (
                    <Row row={detail} key={index} />
                ))}
        </>
    );
}

export default Rows;
