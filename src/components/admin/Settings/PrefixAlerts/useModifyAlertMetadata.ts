import type { PostgrestError } from '@supabase/postgrest-js';
import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { CombinedError } from 'urql';

import { useState } from 'react';

import { isEmpty, isEqual } from 'lodash';
import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useDeleteAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useDeleteAlertSubscription';
import { useEvaluateGlobalPrefixSettings } from 'src/components/admin/Settings/PrefixAlerts/useEvaluateGlobalPrefixSettings';
import { useUpsertAlertConfig } from 'src/components/admin/Settings/PrefixAlerts/useUpsertAlertConfig';
import { useUpsertAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useUpsertAlertSubscription';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { hasOwnProperty, isPromiseFulfilledResult } from 'src/utils/misc-utils';

export function useModifyAlertMetadata(
    closeDialog: () => void,
    deletionTrigger?: boolean
) {
    const intl = useIntl();

    const { upsertSubscription } = useUpsertAlertSubscription();
    const { deleteSubscription } = useDeleteAlertSubscription();

    const { upsertConfig } = useUpsertAlertConfig();

    const { evaluateGlobalPrefixSettings } = useEvaluateGlobalPrefixSettings();

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setServerErrors
    );

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );

    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );
    const immutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.subscriptionMetadata
    );

    const [loading, setLoading] = useState(false);

    const onClick = async () => {
        setLoading(true);
        setServerError([], true);

        if (catalogPrefix.length === 0) {
            logRocketEvent('AlertSubscription', {
                error: 'catalog prefix undefined',
                operation: 'save',
                promiseRejected: 'explicit',
            });

            setLoading(false);
            return Promise.reject();
        }

        const staleSubscriptionQueries: Promise<AlertSubscriptionResponse>[] =
            [];

        if (hasOwnProperty(immutableSubscriptionMetadata, catalogPrefix)) {
            immutableSubscriptionMetadata[catalogPrefix].subscriptions
                .filter(
                    ({ email }) =>
                        !mutableSubscriptionMetadata.subscriptions.some(
                            (mutableSubscription) =>
                                mutableSubscription.email === email
                        )
                )
                .forEach(({ email }) => {
                    staleSubscriptionQueries.push(
                        deleteSubscription({ email, prefix: catalogPrefix })
                    );
                });
        }

        const subscriptionQueries: Promise<AlertSubscriptionResponse>[] =
            mutableSubscriptionMetadata.subscriptions
                .map(({ alertTypes, deleted, email }) => {
                    return deletionTrigger || deleted
                        ? deleteSubscription({ email, prefix: catalogPrefix })
                        : upsertSubscription({
                              alertTypes,
                              email,
                              prefix: catalogPrefix,
                          });
                })
                .concat(staleSubscriptionQueries);

        const serverErrors: (PostgrestError | CombinedError)[] = [];

        await Promise.allSettled(subscriptionQueries).then(
            (responses) => {
                responses.forEach((response) => {
                    if (isPromiseFulfilledResult(response)) {
                        if (!response.value) {
                            logRocketEvent('AlertSubscription', {
                                error: true,
                                missingResponseValue: !response.value,
                            });

                            return;
                        }

                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        const serverError =
                            response.value?.invalid && !response.value?.error
                                ? {
                                      ...BASE_ERROR,
                                      message: intl.formatMessage({
                                          id: 'alerts.config.dialog.error.generic',
                                      }),
                                  }
                                : response.value?.error;

                        if (serverError) {
                            serverErrors.push(serverError);
                        }
                    } else {
                        logRocketEvent('AlertSubscription', {
                            error: String(response),
                            response: String(response),
                            promiseRejected: 'implicit',
                        });
                    }
                });
            },
            (error) => {
                logRocketEvent('AlertSubscription', {
                    error: String(error),
                    promiseRejected: 'explicit',
                });
            }
        );

        // Presently, there is not a GraphQL endpoint available to delete rows
        // from the alert_configs database table when the config is empty. Thus,
        // the only "preventative" measure the client can take is to prevent
        // the insertion of table row when no settings have been defined for a
        // given prefix.
        const {
            directImplicitMatch,
            explicit: { effective: explicitEffectiveConfig },
            implicit: { effective: implicitEffectiveConfig },
        } = evaluateGlobalPrefixSettings();

        const explicitConfigEmpty = isEmpty(explicitEffectiveConfig);
        const implicitConfigEmpty = isEmpty(implicitEffectiveConfig);

        const existingConfigRemoval =
            directImplicitMatch && explicitConfigEmpty && !implicitConfigEmpty;

        const configUpsertRequired =
            existingConfigRemoval ||
            (!explicitConfigEmpty && implicitConfigEmpty) ||
            (!explicitConfigEmpty &&
                !implicitConfigEmpty &&
                !isEqual(explicitEffectiveConfig, implicitEffectiveConfig));

        if (
            configUpsertRequired &&
            mutableSubscriptionMetadata.configs.standard
        ) {
            const configResponse = await upsertConfig({
                catalogPrefixOrName: catalogPrefix,
                config: mutableSubscriptionMetadata.configs.standard,
            });

            if (configResponse?.error || configResponse?.invalid) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                const serverError =
                    configResponse?.invalid && !configResponse?.error
                        ? {
                              ...BASE_ERROR,
                              message: intl.formatMessage({
                                  id: 'alerts.config.dialog.error.generic',
                              }),
                          }
                        : configResponse?.error;

                if (serverError) {
                    serverErrors.push(serverError);
                }
            }
        }

        if (serverErrors.length === 0) {
            closeDialog();
        }

        setServerError(serverErrors);
        setLoading(false);
    };

    return {
        loading,
        onClick,
    };
}
