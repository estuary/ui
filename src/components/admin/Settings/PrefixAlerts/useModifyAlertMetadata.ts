import type { PostgrestError } from '@supabase/postgrest-js';
import type { AlertSubscriptionResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { CombinedError } from 'urql';

import { useState } from 'react';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useDeleteAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useDeleteAlertSubscription';
import { useUpsertAlertConfig } from 'src/components/admin/Settings/PrefixAlerts/useUpsertAlertConfig';
import { useUpsertAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useUpsertAlertSubscription';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';

export function useModifyAlertMetadata(
    closeDialog: () => void,
    deletionTrigger?: boolean
) {
    const intl = useIntl();

    const { upsertSubscription } = useUpsertAlertSubscription();
    const { deleteSubscription } = useDeleteAlertSubscription();

    const { upsertConfig } = useUpsertAlertConfig();

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setServerErrors
    );

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );

    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
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

            return Promise.reject();
        }

        const subscriptionQueries: Promise<AlertSubscriptionResponse>[] =
            mutableSubscriptionMetadata.subscriptions.map((subscription) => {
                const { alertTypes, email } = subscription;

                return deletionTrigger || subscription.deleted
                    ? deleteSubscription({ email, prefix: catalogPrefix })
                    : upsertSubscription({
                          alertTypes,
                          email,
                          prefix: catalogPrefix,
                      });
            });

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

                        // TODO: Detect single subscription deletions when evaluating the operation performed.
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        const serverError =
                            response.value?.invalid && !response.value?.error
                                ? {
                                      ...BASE_ERROR,
                                      message: intl.formatMessage(
                                          {
                                              id: 'alerts.config.dialog.error.generic',
                                          },
                                          {
                                              operation: intl.formatMessage({
                                                  id: deletionTrigger
                                                      ? 'alerts.config.dialog.error.term.delete'
                                                      : 'alerts.config.dialog.error.term.modify',
                                              }),
                                          }
                                      ),
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

        const configResponse = await upsertConfig({
            catalogPrefixOrName: catalogPrefix,
            config: mutableSubscriptionMetadata.settings,
        });

        if (configResponse?.error || configResponse?.invalid) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const serverError =
                configResponse?.invalid && !configResponse?.error
                    ? {
                          ...BASE_ERROR,
                          message: intl.formatMessage(
                              {
                                  id: 'alerts.config.dialog.error.generic',
                              },
                              {
                                  operation: intl.formatMessage({
                                      id: deletionTrigger
                                          ? 'alerts.config.dialog.error.term.delete'
                                          : 'alerts.config.dialog.error.term.modify',
                                  }),
                              }
                          ),
                      }
                    : configResponse?.error;

            if (serverError) {
                serverErrors.push(serverError);
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
