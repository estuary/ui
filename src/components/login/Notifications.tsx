import { Snackbar } from '@mui/material';

import { useIntl } from 'react-intl';

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
                <AlertBox severity="error" short title={notificationTitle}>
                    {notificationMessage}
                </AlertBox>
            </Snackbar>
        );
    } else {
        return null;
    }
}

/** @deprecated Prefer the named `LoginNotifications` export */
function LoginNotificationsWrapper({
    notificationMessage,
    notificationTitle,
}: Props) {
    const intl = useIntl();

    return (
        <LoginNotifications
            notificationMessage={
                notificationMessage
                    ? intl.formatMessage({ id: notificationMessage })
                    : undefined
            }
            notificationTitle={
                notificationTitle
                    ? intl.formatMessage({ id: notificationTitle })
                    : undefined
            }
        />
    );
}

export default LoginNotificationsWrapper;
