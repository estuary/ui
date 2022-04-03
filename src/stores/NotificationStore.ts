import { AlertColor } from '@mui/material';
import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';

export interface Notification {
    title: string;
    description: string;
    severity: AlertColor;
}

export interface NotificationState {
    notification: Notification | null;
    notificationHistory: Notification[];
    showNotification: (notification: Notification) => void;
    hideNotification: () => void;
    updateNotificationHistory: (notification: Notification) => void;
    clearNotificationHistory: () => void;
}

const useNotificationStore = create<NotificationState>(
    devtoolsInNonProd(
        (set) => ({
            clearNotificationHistory: () =>
                set(
                    () => ({ notificationHistory: [] }),
                    false,
                    'Notification History Cleared'
                ),
            hideNotification: () =>
                set(
                    () => ({ notification: null }),
                    false,
                    'Notification Hidden'
                ),
            notification: null,
            notificationHistory: [],
            showNotification: (notification) =>
                set(() => ({ notification }), false, 'Notification Shown'),
            updateNotificationHistory: (notification) =>
                set(
                    (state) => ({
                        notificationHistory: [
                            ...state.notificationHistory,
                            notification,
                        ],
                    }),
                    false,
                    'Notification History Updated'
                ),
        }),
        { name: 'notification-state' }
    )
);

export default useNotificationStore;
