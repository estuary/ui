import { Box, Divider, Stack, Typography } from '@mui/material';

import { Branch, withBranch } from 'react-semantic-tree';

import { authenticatedRoutes } from 'src/app/routes';
import MessageWithLink from 'src/components/content/MessageWithLink';
import AccessGrantsTable from 'src/components/tables/AccessGrants';
import usePageTitle from 'src/hooks/usePageTitle';

function AccessGrants() {
    usePageTitle({
        header: authenticatedRoutes.admin.accessGrants.title,
        headerLink: 'https://docs.estuary.dev/reference/authentication/',
    });

    return (
        <>
            <Stack spacing={2} sx={{ my: 2 }}>
                <Box>
                    <Typography component="div" variant="h6" sx={{ mb: 0.5 }}>
                        Access Grants
                    </Typography>

                    <MessageWithLink messageID="admin.roles.message" />
                </Box>

                <Divider />
            </Stack>
            <Branch label="User Grants">
                <AccessGrantsTable tablePrefix="ag" showUser />
            </Branch>

            <AccessGrantsTable tablePrefix="pr" />
        </>
    );
}

export default withBranch('Account Access')(AccessGrants);
