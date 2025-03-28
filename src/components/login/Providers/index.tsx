import { Divider, Stack } from '@mui/material';

import { useIntl } from 'react-intl';
import { getLoginSettings } from 'src/utils/env-utils';
import SSOButton from 'src/components/login/Providers/buttons/SSO';
import LoginButton from 'src/components/login/Providers/LoginButton';
import type { LoginProvidersProps } from 'src/components/login/Providers/types';
import useLoginHandler from 'src/components/login/Providers/useLoginHandler';


const loginSettings = getLoginSettings();

function LoginProviders({
    grantToken,
    isRegister,
    providers = ['google', 'github', 'azure'],
}: LoginProvidersProps) {
    const intl = useIntl();
    const { login } = useLoginHandler(grantToken, isRegister);

    return (
        <Stack
            spacing={2}
            style={{
                alignItems: 'center',
            }}
        >
            {providers.map((provider) => {
                return (
                    <LoginButton
                        key={`oidc-login-button__${provider}`}
                        login={login}
                        provider={provider}
                        isRegister={isRegister}
                    />
                );
            })}
            {loginSettings.showSSO ? (
                <>
                    <Divider flexItem>
                        {intl.formatMessage({
                            id: isRegister
                                ? 'login.sso.separator'
                                : 'login.separator',
                        })}
                    </Divider>
                    <SSOButton isRegister={isRegister} />
                </>
            ) : null}
        </Stack>
    );
}

export default LoginProviders;
