import { FormattedMessage } from 'react-intl';

import { Box, SxProps, Theme, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';

import { authenticatedRoutes } from 'app/routes';

import AdminTabs from 'components/admin/Tabs';
import SingleLineCode from 'components/content/SingleLineCode';

import usePageTitle from 'hooks/usePageTitle';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

function AdminApi() {
    usePageTitle({
        header: authenticatedRoutes.admin.api.title,
        headerLink:
            'https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli',
    });

    const { session } = Auth.useUser();

    return (
        <>
            <AdminTabs />

            <Box sx={boxStyling}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                    <FormattedMessage id="admin.accessToken" />
                </Typography>

                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="admin.accessToken.message" />
                </Typography>

                {/* TODO (defect): Display an error in the event the access token does not exist. */}
                <SingleLineCode value={session?.access_token ?? ''} />
            </Box>
        </>
    );
}

export default AdminApi;
