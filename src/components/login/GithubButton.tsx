import { useIntl } from 'react-intl';
import { GithubLoginButton } from 'react-social-login-buttons';

interface Props {
    login: () => void;
}

const GithubButton = ({ login }: Props) => {
    const intl = useIntl();
    return (
        <GithubLoginButton
            onClick={login}
            text={intl.formatMessage({ id: 'cta.login.github' })}
        />
    );
};

export default GithubButton;
