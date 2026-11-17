import { Divider, Grid, Typography } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AccessToken from 'src/components/admin/Api/AccessToken';
import { RefreshToken } from 'src/components/admin/Api/RefreshToken';
import AdminTabs from 'src/components/admin/Tabs';
import usePageTitle from 'src/hooks/usePageTitle';

function AdminApi() {
    usePageTitle({
        header: authenticatedRoutes.admin.api.title,
    });

    return (
        <>
            <AdminTabs />

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ py: 2 }}>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Programmatic Access to Estuary
                    </Typography>

                    <Typography>
                        Use Refresh and Access tokens to connect to Estuary
                        programmatically.
                    </Typography>
                </Grid>
            </Grid>

            <Divider sx={{ mt: 1, mb: 2 }} />

            <RefreshToken />

            <AccessToken />
        </>
    );
}

export default AdminApi;
