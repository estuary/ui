import { Box, Stack } from '@mui/material';
import LoginButton from './LoginButton';
import { LoginProvidersProps } from './types';
import useLoginHandler from './useLoginHandler';

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
                    <Box key={`oidc-login-button__${provider}`}>
                        <LoginButton
                            login={login}
                            provider={provider}
                            isRegister={isRegister}
                        />
                    </Box>
                );
            })}
        </Stack>
    );
}

export default LoginProviders;
