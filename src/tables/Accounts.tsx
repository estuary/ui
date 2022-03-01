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
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import useAccounts from '../hooks/useAccounts';

interface AccountsTableProps {
    maxHeight: number;
}

function AccountsTable(props: AccountsTableProps) {
    const { maxHeight } = props;

    const {
        data: { accounts },
        loading,
        error,
    } = useAccounts();

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
        <Box
            sx={{
                height: '100%',
                mx: 2,
                overflow: 'auto',
            }}
        >
            {loading ? <FormattedMessage id="common.loading" /> : null}

            {error ? error : null}

            {accounts.length > 0 ? (
                <>
                    <Typography>
                        <FormattedMessage id="terms.accounts" />
                    </Typography>
                    <TableContainer sx={{ maxHeight }}>
                        <Table
                            stickyHeader
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
                                            <TableCell
                                                key={`${column.field}-${index}`}
                                            >
                                                <FormattedMessage
                                                    id={column.headerIntlKey}
                                                />
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accounts.map((row, index) => (
                                    <TableRow
                                        key={`Accounts-${row.id}-${index}`}
                                    >
                                        <TableCell>
                                            {row.attributes.name}
                                        </TableCell>
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
                                                value={
                                                    row.attributes.updated_at
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : null}
        </Box>
    );
}

export default AccountsTable;
