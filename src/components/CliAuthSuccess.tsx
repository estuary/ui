import {
    Box,
    SxProps,
    TextareaAutosize,
    Theme,
    Typography,
} from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { cliAuthClient } from 'services/supabase';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

export function CliAuthSuccess() {
    useBrowserTitle('browserTitle.admin.api');

    // TODO: this is probably the wrong way to do this
    //const user = cliAuthClient.auth.user();
    const session = cliAuthClient.auth.session();
    console.log('cliAuthSuccess', session);

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.admin.api.title,
                headerLink:
                    'https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli',
            }}
        >
            <Box sx={boxStyling}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                    <FormattedMessage id="admin.accessToken" />
                </Typography>

                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="admin.accessToken.message" />
                </Typography>

                <TextareaAutosize
                    minRows={4}
                    cols={50}
                    value={
                        session
                            ? `flowctl auth token --token='${btoa(
                                  JSON.stringify({
                                      access_token: session.access_token,
                                      refresh_token: session.refresh_token,
                                      expires_at:
                                          (session.expires_at ?? 0) +
                                          (session.expires_in ?? 0),
                                  })
                              )}'`
                            : 'oh noes'
                    }
                    id="accessTokenValue"
                />
            </Box>
        </PageContainer>
    );
}

export default CliAuthSuccess;
