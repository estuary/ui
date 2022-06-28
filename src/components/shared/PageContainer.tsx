import { Alert, Container, Paper, Snackbar, useTheme } from '@mui/material';
import { darkGlassBkgWithBlur, lightGlassBkgWithBlur } from 'context/Theme';
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
    const theme = useTheme();
    const backgroundSx =
        theme.palette.mode === 'dark'
            ? darkGlassBkgWithBlur
            : lightGlassBkgWithBlur;

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
                    borderRadius: 5,
                    ...backgroundSx,
                }}
                variant="outlined"
            >
                {children}
            </Paper>
        </Container>
    );
}

export default PageContainer;
