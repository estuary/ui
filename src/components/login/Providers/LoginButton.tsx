import { SupportedProvider } from 'types/authProviders';
import AzureButton from './buttons/Azure';
import GithubButton from './buttons/Github';
import GoogleButton from './buttons/Google';

interface Props {
    login: any;
    provider: SupportedProvider;
    isRegister?: boolean;
}

function LoginButton({ login, provider, isRegister }: Props) {
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
            login={() => login(provider, scopes)}
        />
    );
}

export default LoginButton;
