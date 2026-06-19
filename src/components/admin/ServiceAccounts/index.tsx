import { Box, Divider, Stack, Typography } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AccessToken from 'src/components/admin/Api/AccessToken';
import { RefreshToken } from 'src/components/admin/Api/RefreshToken';
import { ServiceAccountsTable } from 'src/components/admin/ServiceAccounts/Table';
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
                <Stack sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Service Accounts
                    </Typography>

                    <Typography>
                        Service accounts provide non-login identities for CI/CD
                        pipelines, AI agents, and other programmatic
                        integrations, including the Kafka compatible API
                        “dekaf”. Each service account authenticates with API
                        keys and has scoped access to a single catalog prefix.
                    </Typography>
                </Stack>

                <ServiceAccountsTable />
            </Box>

            <AccessToken />
            <Divider sx={{ my: 3 }} />
            <RefreshToken />
        </>
    );
}
