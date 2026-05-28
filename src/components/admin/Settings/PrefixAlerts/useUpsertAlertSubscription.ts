import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertSubscriptionMutationInput } from 'src/types/gql';

import { useCallback } from 'react';

import { difference } from 'lodash';
import { useMutation } from 'urql';

import {
    AlertSubscriptionCreateMutation,
    AlertSubscriptionUpdateMutation,
} from 'src/api/alerts';
import { useGetAlertSubscriptions } from 'src/context/AlertSubscriptions';
import { logRocketEvent } from 'src/services/shared';
import { hasLength } from 'src/utils/misc-utils';

export function useUpsertAlertSubscription() {
    const [{ data }] = useGetAlertSubscriptions();

    const [createSubscriptionResult, mutateCreateSubscription] = useMutation(
        AlertSubscriptionCreateMutation
    );
    const [updateSubscriptionResult, mutateUpdateSubscription] = useMutation(
        AlertSubscriptionUpdateMutation
    );

    const upsertSubscription = useCallback(
        async ({
            alertTypes,
            email,
            prefix,
        }: AlertSubscriptionMutationInput): Promise<AlertSubscriptionResponse> => {
            const existingSubscription = data?.alertSubscriptions.find(
                (subscription) =>
                    subscription.catalogPrefix === prefix &&
                    subscription.email === email
            );

            // If an existing subscription is identical to the mutable subscription,
            // no operation should be performed.
            if (
                existingSubscription &&
                difference(alertTypes, existingSubscription.alertTypes)
                    .length === 0
            ) {
                return Promise.resolve({
                    email,
                    id: crypto.randomUUID(),
                    prefix,
                });
            }

            // If an existing alert subscription matches the catalog prefix and email
            // of the mutable subscription - differing by the target alert types -- an
            // update operation should be performed. If no existing alert subscription
            // can be found, a create operation should be performed.
            const mutateSubscription = existingSubscription
                ? mutateUpdateSubscription
                : mutateCreateSubscription;

            return mutateSubscription({
                alertTypes: hasLength(alertTypes) ? alertTypes : undefined,
                email,
                prefix,
            }).then(
                (response) => {
                    const uuid = crypto.randomUUID();

                    if (response?.error) {
                        logRocketEvent('AlertSubscription', {
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
                        logRocketEvent('AlertSubscription', {
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
                () => {
                    logRocketEvent('AlertSubscription', {
                        operation: 'upsert',
                        promiseRejected: 'explicit',
                    });

                    return Promise.reject();
                }
            );
        },
        [
            data?.alertSubscriptions,
            mutateCreateSubscription,
            mutateUpdateSubscription,
        ]
    );

    return {
        createSubscriptionResult,
        updateSubscriptionResult,
        upsertSubscription,
    };
}
