import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FormattedMessage, useIntl } from 'react-intl';
import useAccounts from '../../hooks/useAccounts';

interface AccountsTableProps {
    height: number;
}

function AccountsTable(props: AccountsTableProps) {
    const { height } = props;

    const {
        data: { accounts },
        loading,
        error,
    } = useAccounts();

    const intl = useIntl();

    const columns = [
        {
            field: 'attributes.name',
            headerName: intl.formatMessage({ id: 'data.name' }),
            valueGetter: (params: any) => params.row.attributes.name,
            width: 150,
        },
        {
            field: 'attributes.email',
            headerName: intl.formatMessage({ id: 'data.email' }),
            valueGetter: (params: any) => params.row.attributes.email,
            width: 250,
        },
        {
            field: 'attributes.display_name',
            headerName: intl.formatMessage({ id: 'data.display_name' }),
            valueGetter: (params: any) => params.row.attributes.display_name,
            width: 150,
        },

        {
            field: 'attributes.updated_at',
            headerName: intl.formatMessage({ id: 'data.updated_at' }),
            valueGetter: (params: any) =>
                intl.formatDate(params.row.attributes.updated_at, {}),
            width: 125,
        },
    ];

    return (
        <Box sx={{ height }}>
            {loading ? <FormattedMessage id="common.loading" /> : null}

            {error ? error : null}

            {accounts.length > 0 ? (
                <>
                    <Typography>
                        <FormattedMessage id="terms.accounts" />
                    </Typography>

                    <DataGrid
                        rows={accounts}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                        disableSelectionOnClick
                    />
                </>
            ) : null}
        </Box>
    );
}

export default AccountsTable;
