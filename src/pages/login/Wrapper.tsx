import type { LoginWrapperProps } from 'src/pages/login/types';

import { Button, Grid, Stack } from '@mui/material';

import { NavArrowLeft } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import FullPageDialog from 'src/components/fullPage/Dialog';
import useLoginBodyClass from 'src/hooks/login/useLoginBodyClass';
import HeaderMessage from 'src/pages/login/HeaderMessage';
import RegisterPerk from 'src/pages/login/Perk';
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
                maxWidth: isRegister ? 900 : 550,
            }}
        >
            <Grid container sx={{ bgcolor: 'blue', width: '100%' }}>
                {isRegister ? (
                    <Grid item xs={12} md={6}>
                        Estuary Flow is a real-time data platform built for the
                        cloud
                    </Grid>
                ) : null}
                <Grid item xs={12} md={isRegister ? 6 : 12}>
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

                        {isRegister ? (
                            <Stack
                                useFlexGap
                                direction={{ xs: 'column', sm: 'row' }}
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                }}
                            >
                                <RegisterPerk messageID="login.register.perks1" />
                                <RegisterPerk messageID="login.register.perks2" />
                            </Stack>
                        ) : null}

                        {children}
                    </Stack>
                </Grid>
            </Grid>
        </FullPageDialog>
    );
};

export default LoginWrapper;
