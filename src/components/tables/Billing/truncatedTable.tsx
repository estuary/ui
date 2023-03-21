import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import Rows from 'components/tables/Billing/Rows';
import { FormattedMessage } from 'react-intl';

const columns = [
    {
        field: 'month',
        headerIntlKey: 'admin.billing.projectedCostTable.label.month',
    },
    {
        field: 'data_volume',
        headerIntlKey: 'admin.billing.projectedCostTable.label.dataVolume',
    },
    {
        field: 'task_count',
        headerIntlKey: 'admin.billing.projectedCostTable.label.tasks',
    },
    {
        field: 'details',
        headerIntlKey: 'admin.billing.projectedCostTable.label.details',
    },
    {
        field: 'total_cost',
        headerIntlKey: 'admin.billing.projectedCostTable.label.totalCost',
    },
];

function TruncatedBillingTable() {
    return (
        <TableContainer component={Box}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableCell key={`${column.field}-${index}`}>
                                <FormattedMessage id={column.headerIntlKey} />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    <Rows />
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TruncatedBillingTable;
