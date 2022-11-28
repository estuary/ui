import {
    Box,
    Button,
    SxProps,
    TextareaAutosize,
    Theme,
    Typography,
} from '@mui/material';
import { Auth } from '@supabase/ui';
import { unauthenticatedRoutes } from 'app/routes';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import LogRocket from 'logrocket';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

export function CliAuthSuccess() {
    const user = Auth.useUser();
    const session = user.session;
    const tokenValue = btoa(
        JSON.stringify({
            access_token: session?.access_token,
            refresh_token: session?.refresh_token,
            expires_at: (session?.expires_at ?? 0) + (session?.expires_in ?? 0),
        })
    );
    useBrowserTitle('browserTitle.cliAuth.success');

    useEffect(() => {
        LogRocket.track(CustomEvents.FLOWCTL_LOGIN, {
            user_id: session?.user?.id,
        });
    }, [tokenValue, session?.user?.id]);

    const copyToken = () => {
        navigator.clipboard.writeText(tokenValue);
    };

    return (
        <PageContainer
            pageTitleProps={{
                header: unauthenticatedRoutes.cliAuth.success.title,
                headerLink:
                    'https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli',
            }}
        >
            <Box sx={boxStyling}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                    <FormattedMessage id="cliAuth.accessToken" />
                </Typography>

                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="cliAuth.accessToken.message" />
                </Typography>

                <TextareaAutosize
                    minRows={4}
                    cols={50}
                    value={tokenValue}
                    id="accessTokenValue"
                />
            </Box>
            <Button onClick={copyToken} sx={{ mb: 1.0 }}>
                <FormattedMessage id="cliAuth.accessToken.copyButton" />
            </Button>
        </PageContainer>
    );
}

export default CliAuthSuccess;
