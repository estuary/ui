import { useIntl } from 'react-intl';
import ReactGoogleButton from 'react-google-button';
import useLoginHints from 'hooks/searchParams/useLoginHints';
import { ProviderButtonProps } from '../types';

const GoogleButton = ({ login, isRegister }: ProviderButtonProps) => {
    const intl = useIntl();

    const { google } = useLoginHints();

    return (
        <ReactGoogleButton
            onClick={() => login(google)}
            label={intl.formatMessage({
                id: isRegister ? 'cta.register.google' : 'cta.login.google',
            })}
        />
    );
};

export default GoogleButton;
