import { Box, SxProps, Theme, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import SingleLineCode from 'components/content/SingleLineCode';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

function AdminApi() {
    useBrowserTitle('browserTitle.admin.api');

    const { session } = Auth.useUser();

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.admin.api.title,
                headerLink:
                    'https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli',
            }}
        >
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
        </PageContainer>
    );
}

export default AdminApi;
