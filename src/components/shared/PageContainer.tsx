import { Container, Paper, Snackbar, useTheme } from '@mui/material';
import Topbar from 'components/navigation/TopBar';
import { paperBackground } from 'context/Theme';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import AlertBox from './AlertBox';

interface Props {
    children: ReactNode | ReactNode[];
    hideBackground?: boolean;
}

function PageContainer({ children, hideBackground }: Props) {
    const theme = useTheme();

    const notification = useNotificationStore(
        notificationStoreSelectors.notification
    );

    const updateNotificationHistory = useNotificationStore(
        notificationStoreSelectors.updateNotificationHistory
    );
    const hideNotification = useNotificationStore(
        notificationStoreSelectors.hideNotification
    );

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

    const alertBody = useMemo(() => {
        if (!notification) {
            return null;
        }

        if (
            typeof notification.title === 'string' &&
            typeof notification.description === 'string'
        ) {
            return `${notification.title}. ${notification.description}`;
        } else {
            return (
                <>
                    {notification.title}
                    {notification.description}
                </>
            );
        }
    }, [notification]);

    return (
        <Container
            maxWidth={false}
            sx={{
                paddingTop: 3,
            }}
        >
            {notification && alertBody ? (
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={displayAlert}
                    autoHideDuration={
                        notification.options?.persist ? null : 7500
                    }
                    onClose={
                        notification.options?.persist
                            ? undefined
                            : handlers.notificationClose
                    }
                    sx={{
                        '& .MuiAlert-action': {
                            display: notification.options?.persist
                                ? 'none'
                                : undefined,
                        },
                    }}
                >
                    <AlertBox
                        severity={notification.severity}
                        short
                        onClose={handlers.notificationClose}
                    >
                        {alertBody}
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
