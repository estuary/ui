import { Auth } from '@supabase/ui';
import {
    DataProcessingNotificationQuery,
    createNotificationPreference,
    getNotificationPreferenceByPrefix,
    getTaskNotification,
} from 'api/alerts';
import { useCallback } from 'react';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength } from 'utils/misc-utils';

const createPreference = async (
    prefix: string,
    userId: string
): Promise<string | null> => {
    const response = await createNotificationPreference(prefix, userId);

    return response.data && response.data.length > 0
        ? response.data[0].catalog_prefix
        : null;
};

function useInitializeTaskNotification(catalogName: string) {
    const { user } = Auth.useUser();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);

    const getNotificationPreference = useCallback(async (): Promise<
        string | null
    > => {
        if (!user?.id || !hasLength(objectRoles)) {
            // Error if the system cannot determine the user ID or object roles cannot be found for the user.
            return null;
        }

        const prefix =
            objectRoles.length === 1
                ? objectRoles[0]
                : objectRoles
                      .filter((role) => catalogName.startsWith(role))
                      .sort((a, b) => b.length - a.length)[0];

        const { data: existingPreference, error: existingPreferenceError } =
            await getNotificationPreferenceByPrefix(prefix, user.id);

        if (existingPreferenceError) {
            // Failed to determine the existence of a notification preference for the task.
            console.log('existing preference error', existingPreferenceError);

            return null;
        }

        if (!existingPreference || existingPreference.length === 0) {
            // A notification preference for the task has not been defined for the user.

            const response = await createPreference(prefix, user.id);

            return response;
        }

        return existingPreference[0].catalog_prefix;
    }, [catalogName, objectRoles, user?.id]);

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

    return { getNotificationSubscription, getNotificationPreference };
}

export default useInitializeTaskNotification;
