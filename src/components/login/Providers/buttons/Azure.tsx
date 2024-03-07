import { useIntl } from 'react-intl';
import { MicrosoftLoginButton } from 'react-social-login-buttons';
import { ProviderButtonProps } from '../types';

const AzureButton = ({ login, isRegister }: ProviderButtonProps) => {
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
