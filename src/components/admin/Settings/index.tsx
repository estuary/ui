import { Divider, Stack } from '@mui/material';

import { authenticatedRoutes } from 'app/routes';

import AdminTabs from 'components/admin/Tabs';

import usePageTitle from 'hooks/usePageTitle';

import { osanoActive } from 'services/osano';

import AdminCookies from './Cookies';
import StorageMappings from './StorageMappings';

function Settings() {
    usePageTitle({
        header: authenticatedRoutes.admin.settings.title,
    });

    return (
        <>
            <AdminTabs />

            <StorageMappings />

            {osanoActive() ? (
                <Stack>
                    <Divider />
                    <AdminCookies />
                </Stack>
            ) : null}
        </>
    );
}

export default Settings;
