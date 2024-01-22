import { Divider, Stack } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import PrefixAlerts from 'components/admin/Settings/PrefixAlerts';
import AdminTabs from 'components/admin/Tabs';
import usePageTitle from 'hooks/usePageTitle';
import StorageMappings from './StorageMappings';

function Settings() {
    usePageTitle({
        header: authenticatedRoutes.admin.settings.title,
    });

    return (
        <>
            <AdminTabs />

            <PrefixAlerts />

            <Stack>
                <Divider sx={{ mt: 2 }} />

                <StorageMappings />
            </Stack>
        </>
    );
}

export default Settings;
