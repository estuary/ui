import { Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import MagicLink from 'components/login/MagicLink';
import LoginProviders from 'components/login/Providers';
import useLoginBodyClass from 'hooks/login/useLoginBodyClass';
import useLoginStateHandler from 'hooks/login/useLoginStateHandler';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import { SupportedProvider } from 'types/authProviders';
import { getLoginSettings } from 'utils/env-utils';

const loginSettings = getLoginSettings();

interface Props {
    showRegistration?: boolean;
}

const Login = ({ showRegistration }: Props) => {
    useBrowserTitle('routeTitle.login');
    useLoginBodyClass();

    const intl = useIntl();
    const provider = useGlobalSearchParams<SupportedProvider | null>(
        GlobalSearchParams.PROVIDER
    );

    const { grantToken, handleChange, isRegister, tabIndex } =
        useLoginStateHandler(showRegistration);

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

                {/*Using h1 as this is the "most important" text on the page and might help with SEO*/}
                <Typography component="h1" align="center" sx={{ my: 4 }}>
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
