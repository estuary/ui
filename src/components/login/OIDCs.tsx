import { Box, Divider } from '@mui/material';
import GoogleAuthButton from 'components/login/OIDCs/Google';
import { FormattedMessage } from 'react-intl';
import useConstant from 'use-constant';

interface Props {
    onError: (messageID: string) => void;
}

function OIDCs({ onError }: Props) {
    const redirectTo = useConstant(
        () => `${window.location.origin}` // `${window.location.origin}${routeDetails.registration.path}`
    );

    return (
        <Box>
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

            <Divider flexItem>
                <FormattedMessage id="login.separator" />
            </Divider>
        </Box>
    );
}

export default OIDCs;
