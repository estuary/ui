import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import MagicLink from 'components/login/MagicLink';
import useLoginBodyClass from 'hooks/login/useLoginBodyClass';
import useLoginStateHandler from 'hooks/login/useLoginStateHandler';

import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage, useIntl } from 'react-intl';

const MagicLinkLogin = () => {
    useBrowserTitle('routeTitle.loginMagicLink');
    useLoginBodyClass();

    const intl = useIntl();

    const { grantToken, handleChange, isRegister, tabIndex } =
        useLoginStateHandler(false);

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
                                ? 'login.magicLink.register.message'
                                : 'login.magicLink.login.message'
                        }
                    />
                </Typography>

                <Stack direction="column" spacing={2}>
                    <Box>
                        <MagicLink hideCodeInput grantToken={grantToken} />
                    </Box>
                </Stack>
            </Box>
        </FullPageDialog>
    );
};

export default MagicLinkLogin;
