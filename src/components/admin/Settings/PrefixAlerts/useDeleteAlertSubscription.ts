import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { BaseAlertSubscriptionMutationInput } from 'src/types/gql';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import { AlertSubscriptionDeleteMutation } from 'src/api/alerts';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

export function useDeleteAlertSubscription() {
    const [deleteSubscriptionResult, mutateSubscription] = useMutation(
        AlertSubscriptionDeleteMutation
    );

    const deleteSubscription = useCallback(
        async ({
            email,
            prefix,
        }: BaseAlertSubscriptionMutationInput): Promise<AlertSubscriptionResponse> => {
            return mutateSubscription({ prefix, email }).then(
                (response) => {
                    const uuid = crypto.randomUUID();

                    if (response?.error) {
                        logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                            errorResponse: response.error,
                            operation: 'delete',
                            variables: response.operation.variables,
                        });

                        const { email, prefix } = response.operation.variables;

                        return Promise.resolve({
                            email,
                            error: response.error,
                            id: uuid,
                            invalid: true,
                            prefix,
                        });
                    }

                    if (!response || !response?.data) {
                        logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                            missingResponseData: !response.data,
                            operation: 'delete',
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
                        prefix: catalogPrefix,
                        email,
                        id: uuid,
                    });
                },
                (err) => {
                    logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                        operation: 'delete',
                        promiseRejected: 'explicit',
                        errorResponse: err,
                    });

                    return Promise.reject();
                }
            );
        },
        [mutateSubscription]
    );

    return {
        deleteSubscription,
        deleteSubscriptionResult,
    };
}
