import { Auth } from '@supabase/ui';
import {
    createNotification,
    createNotificationPreference,
    getNotificationMessageByName,
    getNotificationPreferenceByPrefix,
    getTaskNotification,
} from 'api/alerts';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { useEntityType } from 'context/EntityContext';
import { useCallback } from 'react';
import { NotificationFullQuery, Notification_EvaluationInterval } from 'types';

const createPreference = async (
    catalogName: string,
    userId: string,
    email: string
): Promise<string | null> => {
    const response = await createNotificationPreference(
        catalogName,
        userId,
        email
    );

    return response.data && response.data.length > 0
        ? response.data[0].id
        : null;
};

const createTaskNotification = async (
    preferenceId: string,
    messageId: string,
    liveSpecId: string,
    evaluationInterval?: Notification_EvaluationInterval
): Promise<NotificationFullQuery | null> => {
    const response = await createNotification(
        preferenceId,
        messageId,
        evaluationInterval,
        liveSpecId
    );

    return response.data && response.data.length > 0 ? response.data[0] : null;
};

function useInitializeTaskNotification(catalogName: string) {
    const { user } = Auth.useUser();

    const entityType = useEntityType();

    const getNotificationPreferenceId = useCallback(async (): Promise<
        string | null
    > => {
        if (!user?.id || !user?.email) {
            // Error if the system cannot determine the user ID or email.
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
                user.id,
                user.email
            );

            return newPreferenceId;
        }

        return existingPreference[0].id;
    }, [catalogName, user?.id, user?.email]);

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
            notificationSettings: liveSpecResponse[0].spec?.notification,
            preferenceId,
        };
    }, [catalogName, entityType, getNotificationPreferenceId]);

    const getNotificationSubscription = useCallback(
        async (
            messageName: string,
            liveSpecId: string,
            preferenceId: string,
            notificationSettings?: any
        ): Promise<{
            data: { notificationId: string | null; messageId: string } | null;
            error?: any;
        }> => {
            const { data: messageResponse, error: messageError } =
                await getNotificationMessageByName(messageName);

            if (
                messageError ||
                !messageResponse ||
                messageResponse.length === 0
            ) {
                // Failed to retrieve the message ID for the notification.

                return { data: null, error: messageError };
            }

            const { id: messageId } = messageResponse[0];

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
                    data: { notificationId: null, messageId },
                    error: existingNotificationError,
                };
            }

            if (!existingNotification || existingNotification.length === 0) {
                // A notification for the task has not been defined for the user.

                const newNotification = await createTaskNotification(
                    preferenceId,
                    messageId,
                    liveSpecId,
                    notificationSettings?.dataProcessingInterval
                );

                return { data: null };
            }

            return { data: existingNotification[0].id };
        },
        [catalogName, entityType]
    );

    return { getNotificationSettingsMetadata, getNotificationSubscription };
}

export default useInitializeTaskNotification;
