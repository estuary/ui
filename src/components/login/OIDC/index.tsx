import { Box, Stack } from '@mui/material';
import { SupportedProvider } from 'types/authProviders';
import LoginButton from './LoginButton';
import useLoginHandler from './useLoginHandler';

interface Props {
    isRegister?: boolean;
    grantToken?: string;
    providers?: SupportedProvider[];
}

function OIDCs({
    grantToken,
    isRegister,
    providers = ['google', 'github', 'azure'],
}: Props) {
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
                        <LoginButton login={login} provider={provider} />
                    </Box>
                );
            })}
        </Stack>
    );
}

export default OIDCs;
