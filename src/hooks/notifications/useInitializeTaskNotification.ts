import type { PostgrestError } from '@supabase/postgrest-js';
import type {
    DataProcessingAlertQuery,
    LegacyAlertSubscriptionQuery,
} from 'src/api/alerts';
import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useCallback, useMemo } from 'react';

import {
    getNotificationSubscriptionForUser,
    getTaskNotification,
} from 'src/api/alerts';
import { useCreateAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useCreateAlertSubscription';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { BASE_ERROR } from 'src/services/supabase';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';
import { hasLength } from 'src/utils/misc-utils';

function useInitializeTaskNotification(catalogName: string) {
    const { createSubscription } = useCreateAlertSubscription();

    const user = useUserStore((state) => state.user);

    const objectRoles = useEntitiesStore_capabilities_adminable();

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

    const createAlertSubscription = useCallback(async (): Promise<{
        data: AlertSubscriptionResponse[];
        error?: PostgrestError;
    }> => {
        if (!user?.email || !prefix) {
            // Error if the system cannot determine the user email or object roles cannot be found for the user.
            return {
                data: [],
                error: { ...BASE_ERROR },
            };
        }

        const response = await createSubscription([
            {
                catalogPrefix: prefix,
                email: user.email,
            },
        ]);

        return { data: response };
    }, [createSubscription, prefix, user?.email]);

    const getNotificationSubscription = useCallback(async (): Promise<{
        data: LegacyAlertSubscriptionQuery[] | null;
        error?: PostgrestError;
    }> => {
        if (!user?.email || !prefix) {
            // Error if the system cannot determine the user email or object roles cannot be found for the user.
            return {
                data: null,
                error: { ...BASE_ERROR },
            };
        }

        const { data: existingSubscription, error: existingSubscriptionError } =
            await getNotificationSubscriptionForUser(prefix, user.email);

        if (existingSubscriptionError) {
            // Failed to determine the existence of a notification subscription for the task.
            return { data: null, error: existingSubscriptionError };
        }

        return { data: existingSubscription };
    }, [prefix, user?.email]);

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
        createAlertSubscription,
        getNotifications,
        getNotificationSubscription,
    };
}

export default useInitializeTaskNotification;
