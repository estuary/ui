import { Box, Container, Snackbar, Toolbar, useTheme } from '@mui/material';
import { PageTitleProps } from 'components/navigation/PageTitle';
import Topbar from 'components/navigation/TopBar';
import { glassBkgWithBlur } from 'context/Theme';
import { ReactNode, useEffect, useState } from 'react';
import useNotificationStore, {
    NotificationState,
} from 'stores/NotificationStore';
import AlertBox from './AlertBox';

interface Props {
    children: ReactNode | ReactNode[];
    pageTitleProps?: PageTitleProps;
    hideBackground?: boolean;
}

const selectors = {
    hideNotification: (state: NotificationState) => state.hideNotification,
    notification: (state: NotificationState) => state.notification,
    updateNotificationHistory: (state: NotificationState) =>
        state.updateNotificationHistory,
};

function PageContainer({ children, hideBackground, pageTitleProps }: Props) {
    const theme = useTheme();
    const backgroundSx = glassBkgWithBlur[theme.palette.mode];

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

    const backgroundMixin = hideBackground ? {} : backgroundSx;

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
                    <AlertBox severity={notification.severity} short>
                        {`${notification.title}. ${notification.description}`}
                    </AlertBox>
                </Snackbar>
            ) : null}

            <Topbar pageTitleProps={pageTitleProps} />
            <Toolbar />

            <Box
                sx={{
                    p: 2,
                    width: '100%',
                    ...backgroundMixin,
                }}
            >
                {children}
            </Box>
        </Container>
    );
}

export default PageContainer;
