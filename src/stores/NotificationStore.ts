import { AlertColor } from '@mui/material';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
    description: string;
    severity: AlertColor;
    title: string;
}

export interface NotificationState {
    clearNotificationHistory: () => void;
    hideNotification: () => void;
    notification: Notification | null;
    notificationHistory: Notification[];
    showNotification: (notification: Notification) => void;
    updateNotificationHistory: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>()(
    devtools(
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
        devtoolsOptions('notification-state')
    )
);

export default useNotificationStore;

export const notificationStoreSelectors = {
    showNotification: (state: NotificationState) => state.showNotification,
    hideNotification: (state: NotificationState) => state.hideNotification,
    notification: (state: NotificationState) => state.notification,
    updateNotificationHistory: (state: NotificationState) =>
        state.updateNotificationHistory,
};
