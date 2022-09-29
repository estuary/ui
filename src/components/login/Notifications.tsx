import { Snackbar } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
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
                <AlertBox severity="error" short>
                    <FormattedMessage id={notificationMessage} />
                </AlertBox>
            </Snackbar>
        );
    } else {
        return null;
    }
}

export default LoginNotifications;
