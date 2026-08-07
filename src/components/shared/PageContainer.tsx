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
import { useNavigationStore } from 'src/stores/useNavigationStore';

interface Props {
    children: ReactNode | ReactNode[];
    hideBackground?: boolean;
}

function PageContainer({ children, hideBackground }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const header = useTopBarStore((state) => state.header);
    const navigationOpen = useNavigationStore((state) => state.open);

    // Wider inset once the sidebar is collapsed, at review request, so page
    // content does not sit against the window edge with the sidebar's mass
    // gone.
    //
    // Caution: this applies to the content panel only. The header panel above
    // is fixed at 16px, and the two are welded into one card by a shared corner
    // radius, so with the sidebar collapsed the content sits 24px right of the
    // page title. With the sidebar open the two still agree at 16px.
    const contentPx = navigationOpen ? 2 : { xs: 2, md: 5 };
    const contentPxTransition = (t: typeof theme) =>
        `padding ${t.transitions.duration.shortest}ms`;

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
                        // Separates the header from the content panel below,
                        // which the shared corner radius otherwise welds into
                        // one surface. Kept at review request.
                        borderBottom: '1px solid',
                        borderColor: 'divider',
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
                    // Matches the header Paper's 16px while the sidebar is
                    // open. See contentPx for the collapsed state.
                    px: contentPx,
                    transition: contentPxTransition,
                    // The header's bottom rule is the top edge content is inset
                    // from, exactly as this panel's own edge is the left one,
                    // so the two insets must match — an 8px top against a 16px
                    // left reads as a mistake once the rule gives the eye
                    // something to measure against.
                    py: 2,
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
