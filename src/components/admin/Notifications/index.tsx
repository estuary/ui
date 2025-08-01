import { Box, Divider, Stack, Typography } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AdminTabs from 'src/components/admin/Tabs';
import usePageTitle from 'src/hooks/usePageTitle';

function Notifications() {
    usePageTitle({
        header: authenticatedRoutes.admin.notifications.title,
        headerLink: 'https://docs.estuary.dev/reference/notifications/',
    });

    return (
        <>
            <AdminTabs />
            <Stack spacing={2} sx={{ m: 2 }}>
                <Box>
                    <Typography component="div" variant="h6" sx={{ mb: 0.5 }}>
                        title
                    </Typography>
                    message
                </Box>

                <Divider />
            </Stack>
            table
        </>
    );
}

export default Notifications;
