import { Box } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import { ServiceAccountsList } from 'src/components/admin/ServiceAccounts/List';
import AdminTabs from 'src/components/admin/Tabs';
import usePageTitle from 'src/hooks/usePageTitle';

export function ServiceAccounts() {
    usePageTitle({
        header: authenticatedRoutes.admin.serviceAccounts.title,
    });

    return (
        <>
            <AdminTabs />

            <Box sx={{ p: 2 }}>
                <ServiceAccountsList />
            </Box>
        </>
    );
}
