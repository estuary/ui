import {
    Alert,
    AlertTitle,
    Collapse,
    Container,
    Paper,
    Toolbar,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import useNotificationStore, {
    NotificationState,
} from 'stores/NotificationStore';

const PageContainerPropTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};
type PageContainerProp = PropTypes.InferProps<typeof PageContainerPropTypes>;

const selectors = {
    acknowledgeNotification: (state: NotificationState) =>
        state.acknowledgeNotification,
    notification: (state: NotificationState) => state.notification,
    updateNotificationHistory: (state: NotificationState) =>
        state.updateNotificationHistory,
};

function PageContainer(props: PageContainerProp) {
    const alertTransitionRef = useRef<any>(null);

    const notification = useNotificationStore(selectors.notification);

    const updateNotificationHistory = useNotificationStore(
        selectors.updateNotificationHistory
    );
    const acknowledgeNotification = useNotificationStore(
        selectors.acknowledgeNotification
    );

    const [displayAlert, setDisplayAlert] = useState(true);

    const { children } = props;

    useEffect(() => {
        if (notification) {
            setTimeout(() => {
                if (alertTransitionRef.current) {
                    setDisplayAlert(false);
                }
            }, 10000);
        }
    }, [notification]);

    const handlers = {
        transitionExiting: () => {
            if (notification) {
                updateNotificationHistory(notification);
                acknowledgeNotification();
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
                <Collapse
                    ref={alertTransitionRef}
                    in={displayAlert}
                    onExiting={handlers.transitionExiting}
                >
                    <Alert severity={notification.severity} sx={{ mb: 2 }}>
                        <AlertTitle>{notification.title}</AlertTitle>
                        {notification.description}
                    </Alert>
                </Collapse>
            ) : null}

            <Paper sx={{ width: '100%' }} variant="outlined">
                {children}
            </Paper>
        </Container>
    );
}

export default PageContainer;
