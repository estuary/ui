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
    }, [objectRoles]);

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

    const getNotificationPreference = useCallback(async (): Promise<{
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

        // const prefix =
        //     objectRoles.length === 1
        //         ? objectRoles[0]
        //         : objectRoles
        //               .filter((role) => catalogName.startsWith(role))
        //               .sort((a, b) => b.length - a.length)[0];

        const { data: existingPreference, error: existingPreferenceError } =
            await getNotificationSubscriptionByPrefix(prefix, user.id);

        if (existingPreferenceError) {
            // Failed to determine the existence of a notification preference for the task.
            console.log('existing preference error', existingPreferenceError);

            return { data: null, error: existingPreferenceError };
        }

        return { data: existingPreference };
    }, [catalogName, prefix, user?.id]);

    const getNotificationSubscription = useCallback(
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
                console.log(
                    'existing preference error',
                    existingNotificationError
                );

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
        getNotificationSubscription,
        getNotificationPreference,
    };
}

export default useInitializeTaskNotification;
