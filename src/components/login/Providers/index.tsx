import { Divider, Stack } from '@mui/material';

import SSOButton from './buttons/SSO';
import LoginButton from './LoginButton';
import { LoginProvidersProps } from './types';
import useLoginHandler from './useLoginHandler';
import { useIntl } from 'react-intl';

import { getLoginSettings } from 'src/utils/env-utils';

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
