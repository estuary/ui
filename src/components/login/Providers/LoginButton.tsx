import AzureButton from './buttons/Azure';
import GithubButton from './buttons/Github';
import GoogleButton from './buttons/Google';
import { LoginButtonProps } from './types';

function LoginButton({ login, provider, isRegister }: LoginButtonProps) {
    let ButtonComponent, scopes: string;
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
            isRegister={isRegister}
            login={(params) => login(provider, scopes, params)}
        />
    );
}

export default LoginButton;
