import { useIntl } from 'react-intl';
import { GithubLoginButton } from 'react-social-login-buttons';
import { ProviderButtonProps } from '../types';

const GithubButton = ({ login, isRegister }: ProviderButtonProps) => {
    const intl = useIntl();
    return (
        <GithubLoginButton
            onClick={login}
            text={intl.formatMessage({
                id: isRegister ? 'cta.register.github' : 'cta.login.github',
            })}
        />
    );
};

export default GithubButton;
