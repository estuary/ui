import { Box, Divider, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import AdminTabs from 'src/components/admin/Tabs';
import AlertHistoryTable from 'src/components/tables/AlertHistory';
import usePageTitle from 'src/hooks/usePageTitle';

function Notifications() {
    usePageTitle({
        header: authenticatedRoutes.admin.notifications.title,
        headerLink: 'https://docs.estuary.dev/reference/notifications/',
    });

    const intl = useIntl();

    return (
        <>
            <AdminTabs />
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
            </Stack>
            <AlertHistoryTable />
        </>
    );
}

export default Notifications;
