import { useIntl } from 'react-intl';
import ReactGoogleButton from 'react-google-button';

interface Props {
    login: () => void;
    isRegister?: boolean;
}

const GoogleButton = ({ login, isRegister }: Props) => {
    const intl = useIntl();

    return (
        <ReactGoogleButton
            onClick={login}
            label={intl.formatMessage({
                id: isRegister ? 'cta.register.google' : 'cta.login.google',
            })}
        />
    );
};

export default GoogleButton;
