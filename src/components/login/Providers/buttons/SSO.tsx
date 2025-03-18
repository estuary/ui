import { Box, Button, useTheme } from '@mui/material';
import { loginButtonStyling } from 'context/Theme';
import { useIntl } from 'react-intl';
import { unauthenticatedRoutes } from 'app/routes';
import { Lock } from 'iconoir-react';
import MessageWithLink from 'components/content/MessageWithLink';
import { LoginProps } from '../types';

function SSOButton({ isRegister }: LoginProps) {
    const intl = useIntl();
    const theme = useTheme();

    if (isRegister) {
        return (
            <Box
                sx={{
                    ...loginButtonStyling[theme.palette.mode],
                    borderWidth: 0,
                }}
            >
                <MessageWithLink messageID="login.sso.register.message.help" />
            </Box>
        );
    }

    return (
        <Button
            fullWidth
            startIcon={<Lock />}
            sx={loginButtonStyling[theme.palette.mode]}
            size="large"
            variant="text"
            href={unauthenticatedRoutes.sso.login.fullPath}
        >
            {intl.formatMessage({ id: 'cta.login.sso' })}
        </Button>
    );
}

export default SSOButton;
