import { AlertColor } from '@mui/material';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
    title: string;
    description: string;
    severity: AlertColor;
}

export interface NotificationState {
    notification: Notification | null;
    notificationHistory: Notification[];
    addNotification: (notification: Notification) => void;
    hideNotification: () => void;
    clearNotificationHistory: () => void;
    updateNotificationHistory: (notification: Notification) => void;
}

const useNotificationStore = create<NotificationState>(
    devtools(
        (set) => ({
            addNotification: (notification) =>
                set(() => ({ notification }), false, 'Notification Added'),
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
