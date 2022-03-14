import { Alert, Container, Paper, Snackbar, Toolbar } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import useNotificationStore, {
    NotificationState,
} from 'stores/NotificationStore';

interface PageContainerProps {
    children: ReactNode;
}

const selectors = {
    hideNotification: (state: NotificationState) => state.hideNotification,
    notification: (state: NotificationState) => state.notification,
    updateNotificationHistory: (state: NotificationState) =>
        state.updateNotificationHistory,
};

function PageContainer(props: PageContainerProps) {
    const notification = useNotificationStore(selectors.notification);

    const updateNotificationHistory = useNotificationStore(
        selectors.updateNotificationHistory
    );
    const hideNotification = useNotificationStore(selectors.hideNotification);

    const [displayAlert, setDisplayAlert] = useState(false);

    const { children } = props;

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
            <Toolbar />

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

            <Paper sx={{ width: '100%' }} variant="outlined">
                {children}
            </Paper>
        </Container>
    );
}

export default PageContainer;
