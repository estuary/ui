import { Alert, Snackbar } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    notificationMessage?: string;
}

function LoginNotifications({ notificationMessage }: Props) {
    if (notificationMessage) {
        return (
            <Snackbar
                open={true}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                autoHideDuration={10000}
            >
                <Alert severity="error">
                    <FormattedMessage id={notificationMessage} />
                </Alert>
            </Snackbar>
        );
    } else {
        return null;
    }
}

export default LoginNotifications;
