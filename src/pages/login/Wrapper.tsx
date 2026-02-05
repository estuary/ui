import type { LoginWrapperProps } from 'src/pages/login/types';

import { Button, Grid, Stack } from '@mui/material';

import { NavArrowLeft } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import FullPageDialog from 'src/components/fullPage/Dialog';
import useLinkWithGrantToken from 'src/hooks/login/useLinkWithGrantToken';
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

    const intl = useIntl();
    const backHref = useLinkWithGrantToken(unauthenticatedRoutes.login.path);

    return (
        <FullPageDialog
            paperSx={{
                width: '100%',
                minWidth: 350,
                maxWidth: isRegister ? 1000 : 550,
            }}
        >
            <Grid container sx={{ flexWrap: 'wrap-reverse', width: '100%' }}>
                <Grid
                    size={{ xs: 12 }}
                    md={isRegister ? 6 : 0}
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    {isRegister ? <RegisterMarketing /> : null}
                </Grid>
                <Grid
                    size={{ xs: 12 }}
                    md={isRegister ? 6 : 12}
                    sx={isRegister ? { pl: 5, justifyItems: 'end' } : undefined}
                >
                    {showBack ? (
                        <Button
                            href={backHref}
                            startIcon={<NavArrowLeft />}
                            style={{ alignSelf: 'start' }}
                            variant="text"
                        >
                            {intl.formatMessage({ id: 'login.sso.back' })}
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
