import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import TableLoadingRows from 'components/tables/Loading';
import { FormattedMessage } from 'react-intl';
import { useBilling_billingHistory } from 'stores/Tables/Billing/hooks';
import { TableColumns } from 'types';
import { hasLength } from 'utils/misc-utils';

// TODO: Determine if the details table column is necessary and, if so,
//   what data should be displayed in that column. My proposition is that
//   the tier evaluation for that month should be identified in that column.
const columns: TableColumns[] = [
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
    // {
    //     field: 'details',
    //     headerIntlKey: 'admin.billing.projectedCostTable.label.details',
    // },
    {
        field: 'total_cost',
        headerIntlKey: 'admin.billing.projectedCostTable.label.totalCost',
    },
];

function TruncatedBillingTable() {
    const billingHistory = useBilling_billingHistory();

    return (
        <TableContainer component={Box}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((column, index) =>
                            column.headerIntlKey ? (
                                <TableCell key={`${column.field}-${index}`}>
                                    <FormattedMessage
                                        id={column.headerIntlKey}
                                    />
                                </TableCell>
                            ) : null
                        )}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {hasLength(billingHistory) ? (
                        <Typography>Peace</Typography>
                    ) : (
                        <TableLoadingRows columns={columns} />
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TruncatedBillingTable;
