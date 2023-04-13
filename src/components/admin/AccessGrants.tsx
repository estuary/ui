import { Divider, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import MessageWithLink from 'components/content/MessageWithLink';
import AccessGrantsTable from 'components/tables/AccessGrants';
import useBrowserTitle from 'hooks/useBrowserTitle';
import usePageTitle from 'hooks/usePageTitle';
import { FormattedMessage } from 'react-intl';

function AccessGrants() {
    useBrowserTitle('browserTitle.admin.accessGrants');
    usePageTitle({
        header: authenticatedRoutes.admin.accessGrants.title,
        headerLink: 'https://docs.estuary.dev/reference/authentication/',
    });

    return (
        <>
            <AdminTabs />

            <Stack direction="column" spacing={2} sx={{ m: 2 }}>
                <Typography
                    component="span"
                    variant="h6"
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    <FormattedMessage id="terms.permissions" />
                </Typography>

                <MessageWithLink messageID="admin.roles.message" />

                <Divider />
            </Stack>

            <AccessGrantsTable tablePrefix="ag" showUser />

            <AccessGrantsTable tablePrefix="pr" />
        </>
    );
}

export default AccessGrants;
