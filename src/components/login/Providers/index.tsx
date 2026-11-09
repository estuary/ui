import type { LoginProvidersProps } from 'src/components/login/Providers/types';

import { Divider, Stack } from '@mui/material';

import SSOButton from 'src/components/login/Providers/buttons/SSO';
import LoginButton from 'src/components/login/Providers/LoginButton';
import useLoginHandler from 'src/components/login/Providers/useLoginHandler';
import { getLoginSettings } from 'src/utils/env-utils';

const loginSettings = getLoginSettings();

function LoginProviders({
    grantToken,
    isRegister,
    providers = ['google', 'github', 'azure'],
}: LoginProvidersProps) {
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
                    <Divider flexItem style={{ marginTop: 32 }}>
                        {isRegister
                            ? 'Or to register with Single Sign-On'
                            : 'or'}
                    </Divider>

                    <SSOButton isRegister={isRegister} />
                </>
            ) : null}
        </Stack>
    );
}

export default LoginProviders;
