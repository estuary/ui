import type { LoginWrapperProps } from 'src/pages/login/types';

import { Button, Grid, Stack } from '@mui/material';

import { NavArrowLeft } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import FullPageDialog from 'src/components/fullPage/Dialog';
import useLoginBodyClass from 'src/hooks/login/useLoginBodyClass';
import HeaderMessage from 'src/pages/login/HeaderMessage';
import RegisterMarketing from 'src/pages/login/RegisterMarketing';
import RegisterPerks from 'src/pages/login/RegisterPerks';
import LoginTabs from 'src/pages/login/Tabs';

const LoginWrapper = ({
    children,
    handleChange,
    isRegister,
    showBack,
    tabIndex,
    headerMessageId,
}: LoginWrapperProps) => {
    useLoginBodyClass();

    return (
        <FullPageDialog
            paperSx={{
                width: '100%',
                minWidth: 320,
                maxWidth: 1200,
            }}
        >
            <Grid container sx={{ flexWrap: 'wrap-reverse', width: '100%' }}>
                <Grid item xs={12} md={6}>
                    {isRegister ? <RegisterMarketing /> : <>other content</>}
                </Grid>
                <Grid item xs={12} md={6}>
                    {showBack ? (
                        <Button
                            href={unauthenticatedRoutes.login.path}
                            startIcon={<NavArrowLeft />}
                            style={{ alignSelf: 'start' }}
                            variant="text"
                        >
                            <FormattedMessage id="login.sso.back" />
                        </Button>
                    ) : null}
                    <Stack spacing={4} style={{ width: '100%' }}>
                        <LoginTabs
                            handleChange={handleChange}
                            tabIndex={tabIndex}
                        />

                        <HeaderMessage
                            headerMessageId={headerMessageId}
                            isRegister={isRegister}
                        />

                        {isRegister ? <RegisterPerks /> : null}

                        {children}
                    </Stack>
                </Grid>
            </Grid>
        </FullPageDialog>
    );
};

export default LoginWrapper;
