import { Snackbar } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';

interface Props {
    notificationMessage?: string;
    notificationTitle?: string;
}

function LoginNotifications({ notificationMessage, notificationTitle }: Props) {
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
                <AlertBox
                    severity="error"
                    short
                    title={
                        notificationTitle ? (
                            <FormattedMessage id={notificationTitle} />
                        ) : undefined
                    }
                >
                    <FormattedMessage id={notificationMessage} />
                </AlertBox>
            </Snackbar>
        );
    } else {
        return null;
    }
}

export default LoginNotifications;
