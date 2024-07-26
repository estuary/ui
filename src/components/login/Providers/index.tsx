import { Button, Divider, Stack } from '@mui/material';
import { defaultLoginButtonStyling } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { getLoginSettings } from 'utils/env-utils';
import { unauthenticatedRoutes } from 'app/routes';
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
                <>
                    <Divider flexItem>
                        <FormattedMessage id="login.separator" />
                    </Divider>
                    <Button
                        fullWidth
                        style={defaultLoginButtonStyling}
                        size="large"
                        variant="outlined"
                        href={unauthenticatedRoutes.poc.login.fullPath}
                    >
                        <FormattedMessage id="cta.sso" />
                    </Button>
                </>
            ) : null}
        </Stack>
    );
}

export default LoginProviders;
