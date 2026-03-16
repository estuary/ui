import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { BaseAlertSubscriptionMutationInput } from 'src/types/gql';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import { AlertSubscriptionDeleteMutation } from 'src/api/alerts';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';

export function useDeleteAlertSubscription() {
    const [deleteSubscriptionResult, mutateSubscription] = useMutation(
        AlertSubscriptionDeleteMutation
    );

    const deleteSubscription = useCallback(
        async (
            subscriptionKeys: BaseAlertSubscriptionMutationInput[]
        ): Promise<AlertSubscriptionResponse[]> => {
            const promises = subscriptionKeys.map(({ prefix, email }) =>
                mutateSubscription({ prefix, email })
            );

            const evaluatedResponses: AlertSubscriptionResponse[] = [];

            Promise.allSettled(promises).then(
                (responses) => {
                    responses.forEach((response) => {
                        if (isPromiseFulfilledResult(response)) {
                            logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                                operation: 'delete',
                                successResponse: response,
                            });

                            const uuid = crypto.randomUUID();

                            if (!response.value || !response.value.data) {
                                logRocketEvent(
                                    CustomEvents.ALERT_SUBSCRIPTION,
                                    {
                                        missingResponseValue: !response.value,
                                        missingResponseData: Boolean(
                                            response.value &&
                                                !response.value.data
                                        ),
                                        operation: 'delete',
                                        variables:
                                            response.value.operation.variables,
                                    }
                                );

                                const { email, prefix } =
                                    response.value.operation.variables;

                                evaluatedResponses.push({
                                    prefix,
                                    email,
                                    id: uuid,
                                    invalid: true,
                                });

                                return;
                            }

                            if (response.value.error) {
                                logRocketEvent(
                                    CustomEvents.ALERT_SUBSCRIPTION,
                                    {
                                        errorResponse: response.value.error,
                                        operation: 'delete',
                                        variables:
                                            response.value.operation.variables,
                                    }
                                );

                                const { email, prefix } =
                                    response.value.operation.variables;

                                evaluatedResponses.push({
                                    email,
                                    id: uuid,
                                    invalid: true,
                                    prefix,
                                });

                                return;
                            }

                            const { email, catalogPrefix } =
                                response.value.data;

                            evaluatedResponses.push({
                                prefix: catalogPrefix,
                                email,
                                id: uuid,
                            });

                            return;
                        }

                        logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                            details: response.reason,
                            operation: 'delete',
                            promiseRejected: 'implicit',
                        });
                    });
                },
                (err) => {
                    logRocketEvent(CustomEvents.ALERT_SUBSCRIPTION, {
                        operation: 'delete',
                        promiseRejected: 'explicit',
                        errorResponse: err,
                    });
                }
            );

            return evaluatedResponses;
        },
        [mutateSubscription]
    );

    return {
        deleteSubscription,
        deleteSubscriptionResult,
    };
}
