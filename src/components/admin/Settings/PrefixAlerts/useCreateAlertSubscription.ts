import type {
    AlertSubscriptionKeys,
    AlertSubscriptionResponse,
} from 'src/components/admin/Settings/PrefixAlerts/types';

import { useCallback, useEffect } from 'react';

import { useMutation } from 'urql';

import { AlertSubscriptionCreateMutation } from 'src/api/alerts';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';

export function useCreateAlertSubscription() {
    const [updateSubscriptionResult, updateSubscription] = useMutation(
        AlertSubscriptionCreateMutation
    );

    const createSubscription = useCallback(
        async (
            subscriptionKeys: AlertSubscriptionKeys[]
        ): Promise<AlertSubscriptionResponse[]> => {
            const promises = subscriptionKeys.map(({ catalogPrefix, email }) =>
                updateSubscription({ prefix: catalogPrefix, email })
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
                                    catalogPrefix: prefix,
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
                                    catalogPrefix: prefix,
                                    email,
                                    id: uuid,
                                    invalid: true,
                                });

                                return;
                            }

                            const { email, catalogPrefix } =
                                response.value.data;

                            evaluatedResponses.push({
                                catalogPrefix,
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
        [updateSubscription]
    );

    useEffect(() => {
        console.log(updateSubscriptionResult);
    }, [updateSubscriptionResult]);

    return { createSubscription, updateSubscriptionResult };
}
