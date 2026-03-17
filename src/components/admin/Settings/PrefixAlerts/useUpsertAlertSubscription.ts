import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertSubscriptionMutationInput } from 'src/types/gql';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import {
    AlertSubscriptionCreateMutation,
    AlertSubscriptionUpdateMutation,
} from 'src/api/alerts';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useGetAlertSubscriptions } from 'src/context/AlertSubscriptions';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { hasLength } from 'src/utils/misc-utils';

export function useUpsertAlertSubscription() {
    const [{ data }] = useGetAlertSubscriptions();

    const subscription = useAlertSubscriptionsStore(
        (state) => state.subscription
    );

    const query = data?.alertSubscriptions.find(
        ({ catalogPrefix, email }) =>
            subscription.catalogPrefix === catalogPrefix &&
            subscription.email === email
    )
        ? AlertSubscriptionUpdateMutation
        : AlertSubscriptionCreateMutation;

    const [upsertSubscriptionResult, mutateSubscription] = useMutation(query);

    const upsertSubscription = useCallback(
        async ({
            alertTypes,
            email,
            prefix,
        }: AlertSubscriptionMutationInput): Promise<AlertSubscriptionResponse> => {
            return mutateSubscription({
                alertTypes: hasLength(alertTypes) ? alertTypes : undefined,
                email,
                prefix,
            }).then(
                (response) => {
                    const uuid = crypto.randomUUID();

                    if (response?.error) {
                        logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                            errorResponse: response.error,
                            operation: 'upsert',
                            variables: response.operation.variables,
                        });

                        const { email, prefix } = response.operation.variables;

                        return Promise.resolve({
                            prefix,
                            email,
                            error: response.error,
                            id: uuid,
                            invalid: true,
                        });
                    }

                    if (!response || !response?.data) {
                        logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                            missingResponseData: !response.data,
                            operation: 'upsert',
                            variables: response.operation.variables,
                        });

                        const { email, prefix } = response.operation.variables;

                        return Promise.resolve({
                            prefix,
                            email,
                            id: uuid,
                            invalid: true,
                        });
                    }

                    const { email, catalogPrefix } = response.data;

                    return Promise.resolve({
                        email,
                        id: uuid,
                        prefix: catalogPrefix,
                    });
                },
                (err) => {
                    logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                        operation: 'upsert',
                        promiseRejected: 'explicit',
                        errorResponse: err,
                    });

                    return Promise.reject();
                }
            );
        },
        [mutateSubscription]
    );

    return { upsertSubscription, upsertSubscriptionResult };
}
