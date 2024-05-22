import { Divider, Grid, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import usePageTitle from 'hooks/usePageTitle';
import { FormattedMessage } from 'react-intl';
import AccessToken from './AccessToken';
import RefreshToken from './RefreshToken';

function AdminApi() {
    usePageTitle({
        header: authenticatedRoutes.admin.api.title,
    });

    return (
        <>
            <AdminTabs />

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        <FormattedMessage id="admin.cli_api.header" />
                    </Typography>

                    <Typography>
                        <FormattedMessage id="admin.cli_api.message" />
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
