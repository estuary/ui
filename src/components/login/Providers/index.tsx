import { Button, Stack } from '@mui/material';
import { getLoginSettings } from 'utils/env-utils';
import LoginButton from './LoginButton';
import { LoginProvidersProps } from './types';
import useLoginHandler from './useLoginHandler';

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
            sx={{
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
            {!isRegister && loginSettings.showSSO ? (
                <Button>Sign in with SSO</Button>
            ) : null}
        </Stack>
    );
}

export default LoginProviders;
