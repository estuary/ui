import { Box } from '@mui/material';
import GoogleAuthButton from 'components/login/OIDCs/Google';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import useConstant from 'use-constant';

function OIDCs() {
    const redirectTo = useConstant(
        () => `${window.location.origin}` // `${window.location.origin}${routeDetails.registration.path}`
    );
    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();

    const loginFailed = (key: string) => {
        enqueueSnackbar(
            intl.formatMessage({
                id: `login.loginFailed.${key}`,
            }),
            {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                preventDuplicate: true,
                variant: 'error',
            }
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <GoogleAuthButton
                onError={() => loginFailed('google')}
                redirectPath={redirectTo}
            />
        </Box>
    );
}

export default OIDCs;
