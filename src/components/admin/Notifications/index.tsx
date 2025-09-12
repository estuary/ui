import { Grid } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import PrefixAlerts from 'src/components/admin/Settings/PrefixAlerts';
import AdminTabs from 'src/components/admin/Tabs';
import TenantSelector from 'src/components/shared/TenantSelector';
import usePageTitle from 'src/hooks/usePageTitle';

function Notifications() {
    usePageTitle({
        header: authenticatedRoutes.admin.notifications.title,
        headerLink: 'https://docs.estuary.dev/reference/notifications/',
    });

    return (
        <>
            <AdminTabs />

            <Grid
                container
                spacing={{ xs: 3, md: 2 }}
                sx={{ p: 2, justifyContent: 'flex-end' }}
            >
                <Grid
                    item
                    xs={12}
                    md={3}
                    sx={{ mt: 2.5, display: 'flex', alignItems: 'end' }}
                >
                    <TenantSelector />
                </Grid>
            </Grid>

            <PrefixAlerts />
        </>
    );
}

export default Notifications;
