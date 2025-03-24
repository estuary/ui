import { Stack, Typography } from '@mui/material';
import Logo from 'components/navigation/Logo';
import { FormattedMessage } from 'react-intl';
import { HeaderMessageProps } from './types';

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
