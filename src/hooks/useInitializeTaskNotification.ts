import { Auth } from '@supabase/ui';
import {
    NotificationQuery,
    createNotificationPreference,
    getNotificationPreferenceByPrefix,
    getTaskNotification,
} from 'api/alerts';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { useEntityType } from 'context/EntityContext';
import { useCallback } from 'react';

const createPreference = async (
    catalogName: string,
    userId: string
): Promise<string | null> => {
    const response = await createNotificationPreference(catalogName, userId);

    return response.data && response.data.length > 0
        ? response.data[0].id
        : null;
};

function useInitializeTaskNotification(catalogName: string) {
    const { user } = Auth.useUser();

    const entityType = useEntityType();

    const getNotificationPreferenceId = useCallback(async (): Promise<
        string | null
    > => {
        if (!user?.id) {
            // Error if the system cannot determine the user ID.
            return null;
        }

        const { data: existingPreference, error: existingPreferenceError } =
            await getNotificationPreferenceByPrefix(catalogName, user.id);

        if (existingPreferenceError) {
            // Failed to determine the existence of a notification preference for the task.
            console.log('existing preference error', existingPreferenceError);

            return null;
        }

        if (!existingPreference || existingPreference.length === 0) {
            // A notification preference for the task has not been defined for the user.

            const newPreferenceId = await createPreference(
                catalogName,
                user.id
            );

            return newPreferenceId;
        }

        return existingPreference[0].id;
    }, [catalogName, user?.id]);

    const getNotificationSettingsMetadata = useCallback(async () => {
        const { data: liveSpecResponse, error: liveSpecError } =
            await getLiveSpecsByCatalogName(catalogName, entityType);

        if (
            liveSpecError ||
            !liveSpecResponse ||
            liveSpecResponse.length === 0
        ) {
            // Failed to retrieve the live specification for this task

            return null;
        }

        const preferenceId = await getNotificationPreferenceId();

        if (!preferenceId) {
            return null;
        }

        return {
            liveSpecId: liveSpecResponse[0].id,
            preferenceId,
        };
    }, [catalogName, entityType, getNotificationPreferenceId]);

    const getNotificationSubscription = useCallback(
        async (
            messageId: string,
            liveSpecId: string,
            preferenceId: string
        ): Promise<{
            data: NotificationQuery | null;
            error?: any;
        }> => {
            const {
                data: existingNotification,
                error: existingNotificationError,
            } = await getTaskNotification(preferenceId, messageId, liveSpecId);

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

    return { getNotificationSettingsMetadata, getNotificationSubscription };
}

export default useInitializeTaskNotification;
