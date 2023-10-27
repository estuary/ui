import { PostgrestError } from '@supabase/postgrest-js';
import { Auth } from '@supabase/ui';
import {
    DataProcessingNotificationQuery,
    NotificationSubscriptionQuery,
    createNotificationSubscription,
    getNotificationSubscriptionByPrefix,
    getTaskNotification,
} from 'api/alerts';
import { useCallback, useMemo } from 'react';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength } from 'utils/misc-utils';

function useInitializeTaskNotification(catalogName: string) {
    const { user } = Auth.useUser();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);

    const prefix = useMemo(() => {
        if (!hasLength(objectRoles)) {
            return null;
        }

        return objectRoles.length === 1
            ? objectRoles[0]
            : objectRoles
                  .filter((role) => catalogName.startsWith(role))
                  .sort((a, b) => b.length - a.length)[0];
    }, [catalogName, objectRoles]);

    const createSubscription = useCallback(async (): Promise<{
        data: NotificationSubscriptionQuery[] | null;
        error?: PostgrestError;
    }> => {
        if (!user?.id || !prefix) {
            // Error if the system cannot determine the user ID or object roles cannot be found for the user.
            return {
                data: null,
                error: { message: '', details: '', hint: '', code: '' },
            };
        }

        const response = await createNotificationSubscription(prefix, user.id);

        return response;
    }, [prefix, user?.id]);

    const getNotificationSubscription = useCallback(async (): Promise<{
        data: NotificationSubscriptionQuery[] | null;
        error?: PostgrestError;
    }> => {
        if (!user?.id || !prefix) {
            // Error if the system cannot determine the user ID or object roles cannot be found for the user.
            return {
                data: null,
                error: { message: '', details: '', hint: '', code: '' },
            };
        }

        const { data: existingSubscription, error: existingSubscriptionError } =
            await getNotificationSubscriptionByPrefix(prefix, user.id);

        if (existingSubscriptionError) {
            // Failed to determine the existence of a notification subscription for the task.
            return { data: null, error: existingSubscriptionError };
        }

        return { data: existingSubscription };
    }, [prefix, user?.id]);

    const getNotifications = useCallback(
        async (
            liveSpecId: string
        ): Promise<{
            data: DataProcessingNotificationQuery | null;
            error?: any;
        }> => {
            const {
                data: existingNotification,
                error: existingNotificationError,
            } = await getTaskNotification(liveSpecId);

            if (existingNotificationError) {
                // Failed to determine the existence of a notification for the task.
                return {
                    data: null,
                    error: existingNotificationError,
                };
            }

            if (!existingNotification || existingNotification.length === 0) {
                // A notification for the task has not been defined for the user.

                return { data: null };
            }

            return { data: existingNotification[0] };
        },
        []
    );

    return {
        createSubscription,
        getNotifications,
        getNotificationSubscription,
    };
}

export default useInitializeTaskNotification;
