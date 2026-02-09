import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertSubscriptionCreateMutationInput } from 'src/types/gql';

import { useCallback, useEffect } from 'react';

import { useMutation } from 'urql';

import { AlertSubscriptionCreateMutation } from 'src/api/alerts';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { hasOwnProperty, isPromiseFulfilledResult } from 'src/utils/misc-utils';

export function useCreateAlertSubscription() {
    const [updateSubscriptionResult, updateSubscription] = useMutation(
        AlertSubscriptionCreateMutation
    );

    const alertTypes = useAlertSubscriptionsStore((state) =>
        state.prefix.length > 0 &&
        state.subscriptions &&
        hasOwnProperty(state.subscriptions, state.prefix)
            ? state.subscriptions[state.prefix].alertTypes
            : []
    );

    const createSubscription = useCallback(
        async (
            subscriptionKeys: AlertSubscriptionCreateMutationInput[]
        ): Promise<AlertSubscriptionResponse[]> => {
            const promises = subscriptionKeys.map(({ prefix, email }) =>
                updateSubscription({ alertTypes, email, prefix })
            );

            const evaluatedResponses: AlertSubscriptionResponse[] = [];

            Promise.allSettled(promises).then(
                (responses) => {
                    responses.forEach((response) => {
                        if (isPromiseFulfilledResult(response)) {
                            console.log('>>> response', response);

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
                                        creationError: response.value.error,
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
                            promiseRejected: true,
                            details: response.reason,
                        });
                    });
                },
                (err) => {
                    console.log('>>> err', err);
                }
            );

            return evaluatedResponses;
        },
        [alertTypes, updateSubscription]
    );

    useEffect(() => {
        console.log(updateSubscriptionResult);
    }, [updateSubscriptionResult]);

    return { createSubscription, updateSubscriptionResult };
}
