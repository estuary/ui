import { Alert, Container, Paper, Snackbar } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import useNotificationStore, {
    NotificationState,
} from 'stores/NotificationStore';

interface Props {
    children: ReactNode | ReactNode[];
}

const selectors = {
    hideNotification: (state: NotificationState) => state.hideNotification,
    notification: (state: NotificationState) => state.notification,
    updateNotificationHistory: (state: NotificationState) =>
        state.updateNotificationHistory,
};

function PageContainer({ children }: Props) {
    const notification = useNotificationStore(selectors.notification);

    const updateNotificationHistory = useNotificationStore(
        selectors.updateNotificationHistory
    );
    const hideNotification = useNotificationStore(selectors.hideNotification);

    const [displayAlert, setDisplayAlert] = useState(false);

    useEffect(() => setDisplayAlert(!!notification), [notification]);

    const handlers = {
        notificationClose: () => {
            if (notification) {
                updateNotificationHistory(notification);
                hideNotification();
            }
        },
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                paddingTop: 2,
            }}
        >
            {notification ? (
                <Snackbar
                    open={displayAlert}
                    autoHideDuration={5000}
                    onClose={handlers.notificationClose}
                >
                    <Alert severity={notification.severity} variant="filled">
                        {`${notification.title}. ${notification.description}`}
                    </Alert>
                </Snackbar>
            ) : null}

            <Paper
                sx={{
                    padding: 2,
                    width: '100%',
                    background:
                        'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2.23%, rgba(70, 111, 143, 0.16) 40%)',
                    boxShadow: '0px 4px 30px -1px rgba(0, 0, 0, 0.25)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(20px)',
                }}
                variant="outlined"
            >
                {children}
            </Paper>
        </Container>
    );
}

export default PageContainer;
