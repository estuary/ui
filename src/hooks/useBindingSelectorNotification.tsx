import { useCallback, useMemo, useRef, useState } from 'react';

import { useUnmount } from 'react-use';

export const useBindingSelectorNotification = () => {
    const popperTimeout = useRef<number | null>(null);
    const notificationAnchorEl = useRef<any | null>(null);

    const [notificationMessage, setNotificationMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    const showPopper = useCallback((target: any, message: string) => {
        setNotificationMessage(message);
        setShowNotification(true);

        if (popperTimeout.current) clearTimeout(popperTimeout.current);
        popperTimeout.current = window.setTimeout(() => {
            setShowNotification(false);
        }, 1000);
    }, []);

    useUnmount(() => {
        if (popperTimeout.current) clearTimeout(popperTimeout.current);
    });

    return useMemo(
        () => ({
            showPopper,
            notificationAnchorEl,
            notificationMessage,
            displayNotification: Boolean(
                showNotification && notificationAnchorEl.current
            ),
        }),
        [notificationMessage, showNotification, showPopper]
    );
};
