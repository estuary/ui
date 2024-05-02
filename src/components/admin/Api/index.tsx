import { Box, Divider, Grid, SxProps, Theme, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import SingleLineCode from 'components/content/SingleLineCode';
import usePageTitle from 'hooks/usePageTitle';
import { FormattedMessage } from 'react-intl';
import RefreshToken from './RefreshToken';

const boxStyling: SxProps<Theme> = {
    marginBottom: 5,
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

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        <FormattedMessage id="admin.cli_api.header" />
                    </Typography>

                    <Typography>
                        <FormattedMessage id="admin.cli_api.message" />
                    </Typography>
                </Grid>
            </Grid>

            <Divider sx={{ mt: 1 }} />

            <Box sx={boxStyling}>
                <Typography
                    component="span"
                    sx={{
                        mb: 0.5,
                        alignItems: 'center',
                        fontSize: 18,
                        fontWeight: '400',
                    }}
                >
                    <FormattedMessage id="admin.cli_api.accessToken" />
                </Typography>

                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="admin.cli_api.accessToken.message" />
                </Typography>

                {/* TODO (defect): Display an error in the event the access token does not exist. */}
                <SingleLineCode value={session?.access_token ?? ''} />
            </Box>

            <RefreshToken />
        </>
    );
}

export default AdminApi;
