import { Button } from '@mui/material';
import { defaultLoginButtonStyling } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { unauthenticatedRoutes } from 'app/routes';
import { Lock } from 'iconoir-react';
import { LoginProps } from '../types';

function SSOButton({ isRegister }: LoginProps) {
    return (
        <Button
            fullWidth
            startIcon={<Lock />}
            style={defaultLoginButtonStyling}
            size="large"
            variant="text"
            href={
                isRegister
                    ? unauthenticatedRoutes.sso.register.fullPath
                    : unauthenticatedRoutes.sso.login.fullPath
            }
        >
            <FormattedMessage
                id={isRegister ? 'cta.register.sso' : 'cta.login.sso'}
            />
        </Button>
    );
}

export default SSOButton;
