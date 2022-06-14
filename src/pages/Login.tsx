import { Box, Divider, Stack, Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import MagicLink from 'components/login/MagicLink';
import OIDCs from 'components/login/OIDCs';
import ExternalLink from 'components/shared/ExternalLink';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { useEffectOnce, useLocalStorage } from 'react-use';
import { getLoginSettings, getUrls } from 'utils/env-utils';
import { LocalStorageKeys } from 'utils/localStorage-utils';

const urls = getUrls();
const loginSettings = getLoginSettings();

const Login = () => {
    useBrowserTitle('browserTitle.login');

    const { 2: clearGatewayConfig } = useLocalStorage(LocalStorageKeys.GATEWAY);
    useEffectOnce(() => clearGatewayConfig());

    return (
        <FullPageDialog>
            <Box>
                <Typography align="center" sx={{ mb: 4 }}>
                    <FormattedMessage id="login.oidc.message" />
                </Typography>

                <Stack direction="column" spacing={2}>
                    <Box>
                        <OIDCs />
                    </Box>

                    {loginSettings.showEmail && (
                        <>
                            <Divider flexItem>
                                <FormattedMessage id="login.separator" />
                            </Divider>

                            <Box>
                                <MagicLink />
                            </Box>
                        </>
                    )}
                </Stack>

                <Typography align="center" sx={{ mt: 6 }}>
                    <FormattedMessage
                        id="login.documentAcknowledgement"
                        values={{
                            privacy: (
                                <ExternalLink
                                    hideIcon
                                    link={urls.privacyPolicy}
                                >
                                    <FormattedMessage id="register.label.documentAcknowledgement.privacy" />
                                </ExternalLink>
                            ),
                            terms: (
                                <ExternalLink
                                    hideIcon
                                    link={urls.termsOfService}
                                >
                                    <FormattedMessage id="register.label.documentAcknowledgement.terms" />
                                </ExternalLink>
                            ),
                        }}
                    />
                </Typography>
            </Box>
        </FullPageDialog>
    );
};

export default Login;
