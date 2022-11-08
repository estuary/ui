import { Box, Divider, Stack, Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import MagicLink from 'components/login/MagicLink';
import OIDCs from 'components/login/OIDCs';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { useEffectOnce, useLocalStorage } from 'react-use';
import { getLoginSettings } from 'utils/env-utils';
import { LocalStorageKeys } from 'utils/localStorage-utils';

const loginSettings = getLoginSettings();

const Login = () => {
    useBrowserTitle('browserTitle.login');

    const { 2: clearGatewayConfig } = useLocalStorage(LocalStorageKeys.GATEWAY);
    useEffectOnce(() => clearGatewayConfig());

    return (
        <FullPageDialog>
            <Box sx={{ mt: 2 }}>
                <Typography align="center" sx={{ mb: 4 }}>
                    <FormattedMessage id="login.oidc.message" />
                </Typography>

                <Stack direction="column" spacing={2}>
                    <Box>
                        <OIDCs />
                    </Box>

                    {loginSettings.showEmail ? (
                        <>
                            <Divider flexItem>
                                <FormattedMessage id="login.separator" />
                            </Divider>

                            <Box>
                                <MagicLink />
                            </Box>
                        </>
                    ) : null}
                </Stack>
            </Box>
        </FullPageDialog>
    );
};

export default Login;
