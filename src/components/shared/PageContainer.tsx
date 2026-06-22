import type { ReactNode } from 'react';
import type { Notification } from 'src/stores/NotificationStore';

import { useEffect, useMemo, useState } from 'react';

import { Box, Paper, Snackbar, Typography, useTheme } from '@mui/material';

import { Building } from 'iconoir-react';
import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { SidePanelDocsOpenButton } from 'src/components/sidePanelDocs/OpenButton';
import { paperBackground } from 'src/context/Theme';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'src/stores/NotificationStore';
import { useTenantStore } from 'src/stores/Tenant';
import { useTopBarStore } from 'src/stores/TopBar/Store';

interface Props {
    children: ReactNode | ReactNode[];
    hideBackground?: boolean;
    navigationOpen?: boolean;
}

function PageContainer({
    children,
    hideBackground,
    navigationOpen = true,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
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

    const terminalOpen = useCopilotAssistantStore((state) => state.open);

    // Drag the breadcrumb bar to resize the assistant terminal that sits
    // directly above it in the content column — a larger grab target than the
    // terminal's own bottom edge. Active only while the terminal is expanded;
    // the store clamps the height. Relative drag (track the delta from the grab
    // point) keeps the bar under the cursor as the terminal grows and shrinks.
    const startTerminalResize = (event: React.MouseEvent) => {
        if (!terminalOpen) {
            return;
        }
        event.preventDefault();
        const { expandedHeight, setExpandedHeight, setResizingTerminal } =
            useCopilotAssistantStore.getState();
        const startY = event.clientY;
        setResizingTerminal(true);

        const onMove = (moveEvent: MouseEvent) => {
            setExpandedHeight(expandedHeight + (moveEvent.clientY - startY));
        };
        const onUp = () => {
            setResizingTerminal(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

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
                    onMouseDown={startTerminalResize}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        py: 1,
                        px: 2,
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        width: '100%',
                        boxShadow: boxShadowMixin,
                        borderRadius: '16px 16px 0 0',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: backgroundMixin,
                        // While the terminal is expanded the bar doubles as its
                        // resize handle; no hover restyle, just the resize cursor.
                        cursor: terminalOpen ? 'ns-resize' : undefined,
                        userSelect: terminalOpen ? 'none' : undefined,
                    }}
                >
                    <Building />
                    <Typography>
                        {selectedTenant.replace(/\/$/, '')}
                        {' / '}
                        <Box component="span" fontWeight="bold">
                            {intl.formatMessage({ id: header })}
                        </Box>
                    </Typography>

                    {/* Docs toggle, pushed to the trailing edge. Stop the
                    mousedown from reaching the bar's resize handler so clicking
                    the button opens docs rather than starting a terminal drag. */}
                    <Box
                        onMouseDown={(event) => event.stopPropagation()}
                        sx={{ ml: 'auto' }}
                    >
                        <SidePanelDocsOpenButton />
                    </Box>
                </Paper>
            ) : null}

            <Paper
                sx={{
                    px: navigationOpen ? 1 : { xs: 1, md: 5 },
                    transition: (t) =>
                        `padding ${t.transitions.duration.shortest}ms`,
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
