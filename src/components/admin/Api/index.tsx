import { Box, Link, Typography } from '@mui/material';

import { Link as RouterLink } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import AdminTabs from 'src/components/admin/Tabs';
import usePageTitle from 'src/hooks/usePageTitle';

function AdminApi() {
    usePageTitle({
        header: authenticatedRoutes.admin.api.title,
    });

    return (
        <>
            <AdminTabs />

            <Box sx={{ p: 2 }}>
                <Typography>
                    Refresh tokens and access tokens have moved to the{' '}
                    <Link
                        component={RouterLink}
                        to={authenticatedRoutes.admin.serviceAccounts.fullPath}
                    >
                        Service Accounts
                    </Link>{' '}
                    tab.
                </Typography>
            </Box>
        </>
    );
}

export default AdminApi;
