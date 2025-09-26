import type { HTMLAttributeAnchorTarget, ReactNode } from 'react';
import type { LoginProps } from 'src/components/login/Providers/types';

import { Button, Typography, useTheme } from '@mui/material';

import { Lock, OpenNewWindow } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import { loginButtonStyling } from 'src/context/Theme';
import useLinkWithGrantToken from 'src/hooks/login/useLinkWithGrantToken';

function SSOButton({ isRegister }: LoginProps) {
    const intl = useIntl();
    const theme = useTheme();

    let href: string = useLinkWithGrantToken(
        unauthenticatedRoutes.sso.login.fullPath
    );
    let endIcon: ReactNode | undefined;
    let startIcon: ReactNode | undefined = <Lock />;
    let labelMessageId: string = 'cta.login.sso';
    let target: HTMLAttributeAnchorTarget = '_self';
    if (isRegister) {
        endIcon = (
            <Typography>
                <OpenNewWindow />
            </Typography>
        );
        href = intl.formatMessage({
            id: 'login.sso.register.message.help.docPath',
        });
        startIcon = undefined;
        labelMessageId = 'login.sso.register.message.help';
        target = '_blank';
    }

    return (
        <Button
            endIcon={endIcon}
            fullWidth
            href={href}
            size="large"
            startIcon={startIcon}
            target={target}
            variant="text"
            sx={loginButtonStyling[theme.palette.mode]}
        >
            {intl.formatMessage({ id: labelMessageId })}
        </Button>
    );
}

export default SSOButton;
