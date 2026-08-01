import { Box } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import { ServiceAccountsList } from 'src/components/admin/ServiceAccounts/List';
import usePageTitle from 'src/hooks/usePageTitle';

export function ServiceAccounts() {
    usePageTitle({
        header: authenticatedRoutes.admin.serviceAccounts.title,
    });

    return (
        <Box sx={{ py: 2 }}>
            <ServiceAccountsList />
        </Box>
    );
}
