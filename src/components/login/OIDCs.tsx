import { Box } from '@mui/material';
import GoogleAuthButton from 'components/login/OIDCs/Google';
import useConstant from 'use-constant';

interface Props {
    onError: (messageID: string) => void;
}

function OIDCs({ onError }: Props) {
    const redirectTo = useConstant(
        () => `${window.location.origin}` // `${window.location.origin}${routeDetails.registration.path}`
    );

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <GoogleAuthButton
                onError={() => onError('login.loginFailed.google')}
                redirectPath={redirectTo}
            />
        </Box>
    );
}

export default OIDCs;
