import { Divider, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getLoginSettings } from 'utils/env-utils';
import LoginButton from './LoginButton';
import { LoginProvidersProps } from './types';
import useLoginHandler from './useLoginHandler';
import SSOButton from './buttons/SSO';

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
                    <Divider flexItem>
                        <FormattedMessage id="login.separator" />
                    </Divider>
                    <SSOButton isRegister={isRegister} />
                </>
            ) : null}
        </Stack>
    );
}

export default LoginProviders;
