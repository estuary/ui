import { Box, Button } from '@mui/material';
import { defaultLoginButtonStyling } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { unauthenticatedRoutes } from 'app/routes';
import { Lock } from 'iconoir-react';
import MessageWithLink from 'components/content/MessageWithLink';
import { LoginProps } from '../types';

function SSOButton({ isRegister }: LoginProps) {
    if (isRegister) {
        return (
            <Box style={{ ...defaultLoginButtonStyling, borderWidth: 0 }}>
                <MessageWithLink messageID="login.sso.register.message.help" />
            </Box>
        );
    }

    return (
        <Button
            fullWidth
            startIcon={<Lock />}
            style={defaultLoginButtonStyling}
            size="large"
            variant="text"
            href={unauthenticatedRoutes.sso.login.fullPath}
        >
            <FormattedMessage id="cta.login.sso" />
        </Button>
    );
}

export default SSOButton;
