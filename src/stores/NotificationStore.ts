import { ReactNode } from 'react';

import { AlertColor, SnackbarProps } from '@mui/material';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { devtoolsOptions } from 'src/utils/store-utils';

export interface Notification {
    title: string | ReactNode;
    description: string | ReactNode;
    severity: AlertColor;
    disableClickAwayClose?: boolean;
    options?: SnackbarProps;
}

export interface NotificationState {
    notification: Notification | null;
    notificationHistory: Notification[];
    showNotification: (notification: Notification) => void;
    hideNotification: () => void;
    updateNotificationHistory: (notification: Notification) => void;
    clearNotificationHistory: () => void;
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
