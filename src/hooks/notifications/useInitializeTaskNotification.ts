import { PostgrestError } from '@supabase/postgrest-js';
import { useUser } from 'context/UserContext';
import {
    AlertSubscriptionQuery,
    DataProcessingAlertQuery,
    createNotificationSubscription,
    getNotificationSubscriptionForUser,
    getTaskNotification,
} from 'api/alerts';
import { useCallback, useMemo } from 'react';
import { BASE_ERROR } from 'services/supabase';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength } from 'utils/misc-utils';

function useInitializeTaskNotification(catalogName: string) {
    const { session } = useUser();

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
        data: AlertSubscriptionQuery[] | null;
        error?: PostgrestError;
    }> => {
        if (!session?.user.email || !prefix) {
            // Error if the system cannot determine the user email or object roles cannot be found for the user.
            return {
                data: null,
                error: { ...BASE_ERROR },
            };
        }

        const response = await createNotificationSubscription([
            {
                catalog_prefix: prefix,
                email: session.user.email,
            },
        ]);

        return response;
    }, [prefix, session?.user.email]);

    const getNotificationSubscription = useCallback(async (): Promise<{
        data: AlertSubscriptionQuery[] | null;
        error?: PostgrestError;
    }> => {
        if (!session?.user.email || !prefix) {
            // Error if the system cannot determine the user email or object roles cannot be found for the user.
            return {
                data: null,
                error: { ...BASE_ERROR },
            };
        }

        const { data: existingSubscription, error: existingSubscriptionError } =
            await getNotificationSubscriptionForUser(
                prefix,
                session.user.email
            );

        if (existingSubscriptionError) {
            // Failed to determine the existence of a notification subscription for the task.
            return { data: null, error: existingSubscriptionError };
        }

        return { data: existingSubscription };
    }, [prefix, session?.user.email]);

    const getNotifications = useCallback(async (): Promise<{
        data: DataProcessingAlertQuery | null;
        error?: any;
    }> => {
        const { data: existingNotification, error: existingNotificationError } =
            await getTaskNotification(catalogName);

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
    }, [catalogName]);

    return {
        createSubscription,
        getNotifications,
        getNotificationSubscription,
    };
}

export default useInitializeTaskNotification;
