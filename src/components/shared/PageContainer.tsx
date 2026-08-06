import type { ReactNode } from 'react';
import type { Notification } from 'src/stores/NotificationStore';

import { useEffect, useMemo, useState } from 'react';

import { Box, Paper, Snackbar, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import SidePanelDocsOpenButton from 'src/components/sidePanelDocs/OpenButton';
import { paperBackground } from 'src/context/Theme';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'src/stores/NotificationStore';
import { useTopBarStore } from 'src/stores/TopBar/Store';

interface Props {
    children: ReactNode | ReactNode[];
    hideBackground?: boolean;
}

function PageContainer({ children, hideBackground }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const header = useTopBarStore((state) => state.header);

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
        <Box
            sx={{
                pr: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
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

            {header ? (
                <Paper
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        py: 0.5,
                        px: 2,
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        width: '100%',
                        boxShadow: boxShadowMixin,
                        borderRadius: '16px 16px 0 0',
                        background: backgroundMixin,
                    }}
                >
                    <Typography sx={{ fontWeight: 'bold' }}>
                        {intl.formatMessage({ id: header })}
                    </Typography>

                    {/* TODO (UI / UX) - restore the per-page documentation link here.
                        Pages still set headerLink via usePageTitle but nothing renders it. */}

                    <Box sx={{ ml: 'auto' }}>
                        <SidePanelDocsOpenButton />
                    </Box>
                </Paper>
            ) : null}

            <Paper
                sx={{
                    // The same 16px as the header Paper above. This used to be
                    // 8px with the sidebar out and 40px with it collapsed, on
                    // the reasoning that a wider pane wants more breathing
                    // room — but the header's padding is fixed, and the two
                    // Papers are joined into one card by the shared corner
                    // radius, so collapsing the sidebar stepped the page's
                    // content 32px right of its own title. Someone collapsing
                    // the sidebar is asking for width; taking 80px of it back
                    // as padding argued with them.
                    px: 2,
                    // Tighter against a header, which is joined to this panel
                    // by the shared corner radius below and so already provides
                    // the separation the full padding was doing. Unchanged on
                    // pages that have no header.
                    pt: header ? 1 : 2,
                    pb: 2,
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    overscrollBehavior: 'none',
                    width: '100%',
                    mb: 1,
                    boxShadow: boxShadowMixin,
                    borderRadius: header ? '0 0 16px 16px' : 8,
                    background: backgroundMixin,
                }}
            >
                {children}
            </Paper>
        </Box>
    );
}

export default PageContainer;
