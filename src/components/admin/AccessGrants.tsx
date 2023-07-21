import { FormattedMessage } from 'react-intl';

import { Box, Divider, Stack, Typography } from '@mui/material';

import { authenticatedRoutes } from 'app/routes';

import AdminTabs from 'components/admin/Tabs';
import MessageWithLink from 'components/content/MessageWithLink';
import AccessGrantsTable from 'components/tables/AccessGrants';

import usePageTitle from 'hooks/usePageTitle';

function AccessGrants() {
    usePageTitle({
        header: authenticatedRoutes.admin.accessGrants.title,
        headerLink: 'https://docs.estuary.dev/reference/authentication/',
    });

    return (
        <>
            <AdminTabs />

            <Stack spacing={2} sx={{ m: 2 }}>
                <Box>
                    <Typography component="div" variant="h6" sx={{ mb: 0.5 }}>
                        <FormattedMessage id="terms.permissions" />
                    </Typography>

                    <MessageWithLink messageID="admin.roles.message" />
                </Box>

                <Divider />
            </Stack>

            <AccessGrantsTable tablePrefix="ag" showUser />

            <AccessGrantsTable tablePrefix="pr" />
        </>
    );
}

export default AccessGrants;
