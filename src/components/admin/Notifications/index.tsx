import { Box, Divider, Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';
import { gql } from 'urql';

import { authenticatedRoutes } from 'src/app/routes';
import PrefixAlerts from 'src/components/admin/Settings/PrefixAlerts';
import AdminTabs from 'src/components/admin/Tabs';
import TenantSelector from 'src/components/shared/TenantSelector';
import AlertHistoryTable from 'src/components/tables/AlertHistory';
import usePageTitle from 'src/hooks/usePageTitle';
import { useTenantStore } from 'src/stores/Tenant/Store';

const alertHistoryQuery = gql`
    query AlertHistory($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            catalogName
            firedAt
            alertType
            alertDetails: arguments
            resolvedAt
        }
    }
`;

function Notifications() {
    usePageTitle({
        header: authenticatedRoutes.admin.notifications.title,
        headerLink: 'https://docs.estuary.dev/reference/notifications/',
    });

    const intl = useIntl();
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

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

            <Stack spacing={2} sx={{ m: 2 }}>
                <Box>
                    <Typography component="div" variant="h6" sx={{ mb: 0.5 }}>
                        {intl.formatMessage({
                            id: 'admin.notifications.title',
                        })}
                    </Typography>
                    {intl.formatMessage({ id: 'admin.notifications.message' })}
                </Box>

                <Divider />
                <AlertHistoryTable
                    querySettings={{
                        query: alertHistoryQuery,
                        variables: { prefixes: [selectedTenant] },
                    }}
                />
            </Stack>
        </>
    );
}

export default Notifications;
