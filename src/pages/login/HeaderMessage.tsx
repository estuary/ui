import type { HeaderMessageProps } from './types';
import { Stack, Typography } from '@mui/material';
import Logo from 'components/navigation/Logo';
import { FormattedMessage } from 'react-intl';

function HeaderMessage({ isRegister, headerMessageId }: HeaderMessageProps) {
    return (
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Logo width={25} />

            <Typography component="h1" align="center" variant="h5">
                <FormattedMessage
                    id={
                        headerMessageId ??
                        (isRegister
                            ? 'login.register.message'
                            : 'login.login.message')
                    }
                />
            </Typography>
        </Stack>
    );
}

export default HeaderMessage;
