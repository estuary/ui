import type { ReactNode } from 'react';
import type { Notification } from 'src/stores/NotificationStore';

import { useEffect, useMemo, useState } from 'react';

import { Box, Paper, Snackbar, useTheme } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import { paperBackground } from 'src/context/Theme';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'src/stores/NotificationStore';

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
        notificationClose: (notificationBeingClosed?: Notification) => {
            if (notificationBeingClosed) {
                updateNotificationHistory(notificationBeingClosed);
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

    const otherOptions = useMemo(() => {
        return notification?.options ?? {};
    }, [notification]);

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
        <Box sx={{ pr: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {notification && alertBody ? (
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={displayAlert}
                    autoHideDuration={7500}
                    onClose={(_event, reason) => {
                        if (
                            notification.disableClickAwayClose &&
                            reason === 'clickaway'
                        ) {
                            return;
                        }

                        handlers.notificationClose(notification);
                    }}
                    {...otherOptions}
                >
                    <AlertBox
                        severity={notification.severity}
                        short
                        onClose={() => {
                            handlers.notificationClose(notification);
                        }}
                    >
                        {alertBody}
                    </AlertBox>
                </Snackbar>
            ) : null}

            <Paper
                sx={{
                    p: 2,
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    overscrollBehavior: 'none',
                    width: '100%',
                    mb: 1,
                    boxShadow: boxShadowMixin,
                    borderRadius: '1rem',
                    background: backgroundMixin,
                }}
            >
                {children}
            </Paper>
        </Box>
    );
}

export default PageContainer;
