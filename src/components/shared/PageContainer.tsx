import { Container, Paper, Snackbar, useTheme } from '@mui/material';
import Topbar from 'components/navigation/TopBar';
import { paperBackground } from 'context/Theme';
import { ReactNode, useEffect, useState } from 'react';
import useNotificationStore, {
    NotificationState,
} from 'stores/NotificationStore';
import AlertBox from './AlertBox';

interface Props {
    children: ReactNode | ReactNode[];
    // pageTitleProps?: PageTitleProps;
    hideBackground?: boolean;
}

const selectors = {
    hideNotification: (state: NotificationState) => state.hideNotification,
    notification: (state: NotificationState) => state.notification,
    updateNotificationHistory: (state: NotificationState) =>
        state.updateNotificationHistory,
};

function PageContainer({ children, hideBackground }: Props) {
    const theme = useTheme();

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

    const backgroundMixin = hideBackground
        ? 'none'
        : paperBackground[theme.palette.mode];

    const boxShadowMixin = hideBackground
        ? 'none'
        : 'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px';

    return (
        <Container
            maxWidth={false}
            sx={{
                paddingTop: 3,
            }}
        >
            {notification ? (
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={displayAlert}
                    autoHideDuration={7500}
                    onClose={handlers.notificationClose}
                >
                    <AlertBox
                        severity={notification.severity}
                        short
                        onClose={handlers.notificationClose}
                    >
                        {`${notification.title}. ${notification.description}`}
                    </AlertBox>
                </Snackbar>
            ) : null}

            <Topbar />

            <Paper
                sx={{
                    p: 2,
                    width: '100%',
                    boxShadow: boxShadowMixin,
                    borderRadius: 3,
                    background: backgroundMixin,
                }}
            >
                {children}
            </Paper>
        </Container>
    );
}

export default PageContainer;
