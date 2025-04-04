import type { LoginWrapperProps } from 'src/pages/login/types';

import { Button, Stack } from '@mui/material';

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
                maxWidth: 550,
            }}
        >
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
                <LoginTabs handleChange={handleChange} tabIndex={tabIndex} />

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
        </FullPageDialog>
    );
};

export default LoginWrapper;
