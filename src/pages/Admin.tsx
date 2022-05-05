import {
    Box,
    TextareaAutosize,
    Toolbar,
    Typography,
    type SxProps,
    type Theme,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { Auth } from '@supabase/ui';
import PageContainer from 'components/shared/PageContainer';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { TABLES } from 'services/supabase';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const columns: GridColDef[] = [
    {
        field: 'subject_role',
        headerName: 'subject_role',
        flex: 1,
    },
    {
        field: 'object_role',
        headerName: 'object_role',
        flex: 1,
    },
    {
        field: 'capability',
        headerName: 'capability',
        flex: 1,
    },
];

const Admin = () => {
    useBrowserTitle('browserTitle.admin');

    const { session } = Auth.useUser();

    const rolesQuery = useQuery<any>(
        TABLES.ROLE_GRANTS,
        {
            columns: `id, subject_role, object_role, capability`,
        },
        []
    );
    const { data } = useSelect(rolesQuery);

    return (
        <PageContainer>
            <Toolbar>
                <Typography>
                    <FormattedMessage id="admin.header" />
                </Typography>
            </Toolbar>

            {data ? (
                <Box sx={boxStyling}>
                    <Typography variant="h6">
                        <FormattedMessage id="admin.roles" />
                    </Typography>
                    <Typography>
                        <FormattedMessage id="admin.roles.message" />
                    </Typography>
                    <DataGrid
                        rows={data.data}
                        columns={columns}
                        disableSelectionOnClick
                        hideFooter
                        autoHeight
                    />
                </Box>
            ) : null}

            <Box sx={boxStyling}>
                <Typography variant="h6">
                    <FormattedMessage id="admin.accessToken" />
                </Typography>
                <Typography>
                    <FormattedMessage id="admin.accessToken.message" />
                </Typography>
                <TextareaAutosize
                    minRows={4}
                    style={{ width: '100%' }}
                    value={session?.access_token}
                    id="accessTokenValue"
                />
            </Box>
        </PageContainer>
    );
};

export default Admin;
