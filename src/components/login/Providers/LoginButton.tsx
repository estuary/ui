import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { sample_grey } from 'context/Theme';
import AzureButton from './buttons/Azure';
import GithubButton from './buttons/Github';
import GoogleButton from './buttons/Google';
import { LoginButtonProps, ProviderButtonProps } from './types';

function LoginButton({ login, provider, isRegister }: LoginButtonProps) {
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
            style={{
                color: sample_grey[700],
                fontWeight: 500,
            }}
            fullWidth
            isRegister={isRegister}
            login={(params) => login(provider, scopes, params)}
        />
    );
}

export default LoginButton;
