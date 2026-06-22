import { Divider, Stack } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AssistantSettings from 'src/components/admin/Settings/AssistantSettings';
import DataPlanes from 'src/components/admin/Settings/DataPlanes';
import PrefixAlerts from 'src/components/admin/Settings/PrefixAlerts';
import { StorageMappings } from 'src/components/admin/Settings/StorageMappings';
import AdminTabs from 'src/components/admin/Tabs';
import usePageTitle from 'src/hooks/usePageTitle';

function Settings() {
    usePageTitle({
        header: authenticatedRoutes.admin.settings.title,
    });

    return (
        <>
            <AdminTabs />

            <AssistantSettings />

            <Stack>
                <Divider sx={{ mt: 2, mb: 4 }} />

                <PrefixAlerts />
            </Stack>

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
