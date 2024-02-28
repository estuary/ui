import { Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import MagicLink from 'components/login/MagicLink';
import LoginProviders from 'components/login/Providers';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useEffectOnce,
    useLocalStorage,
    useMount,
    useUnmount,
} from 'react-use';
import { SupportedProvider } from 'types/authProviders';
import { getLoginSettings } from 'utils/env-utils';
import { LocalStorageKeys } from 'utils/localStorage-utils';

const loginSettings = getLoginSettings();

interface Props {
    showRegistration?: boolean;
}

// This is to allow this page to have a smaller min width
const bodyClass = 'loginPage';

const Login = ({ showRegistration }: Props) => {
    useBrowserTitle('routeTitle.login');

    const provider = useGlobalSearchParams<SupportedProvider | null>(
        GlobalSearchParams.PROVIDER
    );

    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);
    const { 2: clearGatewayConfig } = useLocalStorage(LocalStorageKeys.GATEWAY);
    useEffectOnce(() => clearGatewayConfig());

    const intl = useIntl();
    const [tabIndex, setTabIndex] = useState(showRegistration ? 1 : 0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const isRegister = tabIndex === 1;

    useMount(() => {
        document.body.classList.add(bodyClass);
    });

    useUnmount(() => {
        document.body.classList.remove(bodyClass);
    });

    return (
        <FullPageDialog>
            <Box sx={{ mt: 2, minWidth: 300, maxWidth: 300 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleChange}
                        variant="fullWidth"
                    >
                        <Tab
                            label={intl.formatMessage({
                                id: 'login.tabs.login',
                            })}
                        />
                        <Tab
                            label={intl.formatMessage({
                                id: 'login.tabs.register',
                            })}
                        />
                    </Tabs>
                </Box>

                <Typography align="center" sx={{ my: 4 }}>
                    <FormattedMessage
                        id={
                            isRegister
                                ? 'login.register.message'
                                : 'login.login.message'
                        }
                    />
                </Typography>

                <Stack direction="column" spacing={2}>
                    <Box>
                        <LoginProviders
                            providers={provider ? [provider] : undefined}
                            isRegister={isRegister}
                            grantToken={grantToken}
                        />
                    </Box>

                    {!isRegister && loginSettings.showEmail ? (
                        <>
                            <Divider flexItem>
                                <FormattedMessage id="login.separator" />
                            </Divider>

                            <Box>
                                <MagicLink grantToken={grantToken} />
                            </Box>
                        </>
                    ) : null}
                </Stack>
            </Box>
        </FullPageDialog>
    );
};

export default Login;
