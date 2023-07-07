import { useIntl } from 'react-intl';
import { MicrosoftLoginButton } from 'react-social-login-buttons';

interface Props {
    login: () => void;
    isRegister?: boolean;
}

const AzureButton = ({ login, isRegister }: Props) => {
    const intl = useIntl();
    return (
        <MicrosoftLoginButton
            onClick={login}
            text={intl.formatMessage({
                id: isRegister ? 'cta.register.azure' : 'cta.login.azure',
            })}
        />
    );
};

export default AzureButton;
