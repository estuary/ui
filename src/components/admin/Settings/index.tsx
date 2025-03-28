import { Divider, Grid, Stack } from '@mui/material';

import DataPlanes from './DataPlanes';
import StorageMappings from './StorageMappings';

import { authenticatedRoutes } from 'src/app/routes';
import PrefixAlerts from 'src/components/admin/Settings/PrefixAlerts';
import AdminTabs from 'src/components/admin/Tabs';
import TenantSelector from 'src/components/shared/TenantSelector';
import usePageTitle from 'src/hooks/usePageTitle';

function Settings() {
    usePageTitle({
        header: authenticatedRoutes.admin.settings.title,
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

            <Stack>
                <Divider sx={{ mt: 2, mb: 4 }} />

                <StorageMappings />
            </Stack>

            <Stack>
                <Divider sx={{ mt: 2, mb: 4 }} />

                <DataPlanes />
            </Stack>
        </>
    );
}

export default Settings;
