import type { HeaderMessageProps } from 'src/pages/login/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import Logo from 'src/components/navigation/Logo';

function HeaderMessage({ isRegister, headerMessageId }: HeaderMessageProps) {
    const intl = useIntl();

    return (
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Logo width={25} />

            <Typography
                component="h1"
                align="center"
                style={{ fontSize: 26, fontWeight: 300 }}
                variant="h5"
            >
                {intl.formatMessage({
                    id:
                        headerMessageId ??
                        (isRegister
                            ? 'login.register.message'
                            : 'login.login.message'),
                })}
            </Typography>
        </Stack>
    );
}

export default HeaderMessage;
