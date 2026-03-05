import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertSubscriptionMutationInput } from 'src/types/gql';

import { useCallback, useEffect } from 'react';

import { useMutation } from 'urql';

import {
    AlertSubscriptionCreateMutation,
    AlertSubscriptionUpdateMutation,
} from 'src/api/alerts';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useGetAlertSubscriptions } from 'src/context/AlertSubscriptions';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';

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
        async (
            subscriptionKeys: AlertSubscriptionMutationInput[]
        ): Promise<AlertSubscriptionResponse[]> => {
            const promises = subscriptionKeys.map(
                ({ alertTypes, prefix, email }) =>
                    mutateSubscription({ alertTypes, email, prefix })
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
        [mutateSubscription]
    );

    useEffect(() => {
        console.log(upsertSubscriptionResult);
    }, [upsertSubscriptionResult]);

    return { upsertSubscription, upsertSubscriptionResult };
}
