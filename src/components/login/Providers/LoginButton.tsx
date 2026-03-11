import type { ReactElement } from 'react';
import type {
    LoginButtonProps,
    ProviderButtonProps,
} from 'src/components/login/Providers/types';

import { useTheme } from '@mui/material';

import AzureButton from 'src/components/login/Providers/buttons/Azure';
import GithubButton from 'src/components/login/Providers/buttons/Github';
import GoogleButton from 'src/components/login/Providers/buttons/Google';
import { loginButtonStyling } from 'src/context/Theme';

function LoginButton({ login, provider, isRegister }: LoginButtonProps) {
    const theme = useTheme();

    let ButtonComponent: (props: ProviderButtonProps) => ReactElement,
        scopes: string;

    switch (provider) {
        case 'github':
            ButtonComponent = GithubButton;
            break;
        case 'azure':
            ButtonComponent = AzureButton;
            scopes = 'openid profile email';
            break;
        default:
            ButtonComponent = GoogleButton;
    }

    return (
        <ButtonComponent
            sx={loginButtonStyling[theme.palette.mode]}
            size="large"
            fullWidth
            isRegister={isRegister}
            login={(params) => login(provider, scopes, params)}
        />
    );
}

export default LoginButton;
