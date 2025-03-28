import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { useTheme } from '@mui/material';
import { loginButtonStyling } from 'src/context/Theme';
import AzureButton from './buttons/Azure';
import GithubButton from './buttons/Github';
import GoogleButton from './buttons/Google';
import { LoginButtonProps, ProviderButtonProps } from './types';

function LoginButton({ login, provider, isRegister }: LoginButtonProps) {
    const theme = useTheme();

    let ButtonComponent: (props: ProviderButtonProps) => EmotionJSX.Element,
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
