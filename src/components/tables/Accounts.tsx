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
import useAccounts from 'hooks/useAccounts';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';

function AccountsTable() {
    const { data: accounts, loading, error } = useAccounts();

    const intl = useIntl();

    const columns = [
        {
            field: 'attributes.name',
            headerIntlKey: 'data.name',
        },
        {
            field: 'attributes.email',
            headerIntlKey: 'data.email',
        },
        {
            field: 'attributes.display_name',
            headerIntlKey: 'data.display_name',
        },

        {
            field: 'attributes.updated_at',
            headerIntlKey: 'data.updated_at',
        },
    ];

    return (
        <Box>
            <Typography>
                <FormattedMessage id="terms.accounts" />
            </Typography>
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350 }}
                    aria-label={intl.formatMessage({
                        id: 'accounts.title',
                    })}
                >
                    <TableHead>
                        <TableRow
                            sx={{
                                background: (theme) =>
                                    theme.palette.background.default,
                            }}
                        >
                            {columns.map((column, index) => {
                                return (
                                    <TableCell key={`${column.field}-${index}`}>
                                        <FormattedMessage
                                            id={column.headerIntlKey}
                                        />
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : accounts && accounts.length > 0 ? (
                            accounts.map((row, index) => (
                                <TableRow
                                    key={`Account-${row.attributes.name}-${index}`}
                                >
                                    <TableCell>{row.attributes.name}</TableCell>
                                    <TableCell>
                                        {row.attributes.email}
                                    </TableCell>
                                    <TableCell>
                                        {row.attributes.display_name}
                                    </TableCell>
                                    <TableCell>
                                        <FormattedDate
                                            day="numeric"
                                            month="long"
                                            year="numeric"
                                            value={row.attributes.updated_at}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    align="center"
                                >
                                    <FormattedMessage id="common.noData" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default AccountsTable;
