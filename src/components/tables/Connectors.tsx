import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import useConnectors from 'hooks/useConnectors';
import { FormattedMessage, useIntl } from 'react-intl';

interface ConnectorsTableProps {
    height: number;
}

function ConnectorsTable(props: ConnectorsTableProps) {
    const { height } = props;

    const {
        data: { connectors },
        loading,
        error,
    } = useConnectors();

    const intl = useIntl();

    const columns = [
        {
            field: 'attributes.name',
            headerName: intl.formatMessage({ id: 'data.name' }),
            valueGetter: (params: any) => params.row.attributes.name,
            width: 150,
        },
        {
            field: 'attributes.description',
            headerName: intl.formatMessage({ id: 'data.description' }),
            valueGetter: (params: any) => params.row.attributes.description,
            width: 250,
        },
        {
            field: 'attributes.type',
            headerName: intl.formatMessage({ id: 'data.type' }),
            valueGetter: (params: any) => params.row.attributes.type,
            width: 100,
        },

        {
            field: 'attributes.maintainer',
            headerName: intl.formatMessage({ id: 'data.maintainer' }),
            valueGetter: (params: any) => params.row.attributes.maintainer,
            width: 125,
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
        <Box
            sx={{
                height,
            }}
        >
            {loading ? <FormattedMessage id="common.loading" /> : null}

            {error ? { fetchingConnectorsError: error } : null}

            {connectors.length > 0 ? (
                <>
                    <Typography>
                        <FormattedMessage id="terms.connectors" />
                    </Typography>
                    <DataGrid
                        rows={connectors}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                        disableSelectionOnClick
                        autoHeight
                    />
                </>
            ) : null}
        </Box>
    );
}

export default ConnectorsTable;
