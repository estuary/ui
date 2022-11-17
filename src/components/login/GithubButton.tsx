import { useIntl } from 'react-intl';
import { GithubLoginButton } from 'react-social-login-buttons';

interface Props {
    login: () => void;
    isRegister?: boolean;
}

const GithubButton = ({ login, isRegister }: Props) => {
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
