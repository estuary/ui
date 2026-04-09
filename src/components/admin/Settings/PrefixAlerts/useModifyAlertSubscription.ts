import type { BaseAlertSubscriptionMutationInput } from 'src/types/gql';

import { useState } from 'react';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useDeleteAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useDeleteAlertSubscription';
import { useUpsertAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useUpsertAlertSubscription';
import { BASE_ERROR } from 'src/services/supabase';

export function useModifyAlertSubscription(
    closeDialog: () => void,
    deletionTrigger?: boolean
) {
    const intl = useIntl();

    const { upsertSubscription } = useUpsertAlertSubscription();
    const { deleteSubscription } = useDeleteAlertSubscription();

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    const subscription = useAlertSubscriptionsStore(
        (state) => state.subscription
    );

    const [loading, setLoading] = useState(false);

    const onClick = async () => {
        setLoading(true);
        setServerError([]);

        const subscriptionInput: BaseAlertSubscriptionMutationInput = {
            email: subscription.email,
            prefix: subscription.catalogPrefix,
        };

        const response = deletionTrigger
            ? await deleteSubscription(subscriptionInput)
            : await upsertSubscription({
                  ...subscriptionInput,
                  alertTypes: subscription.alertTypes,
              });

        // The create could be undefined and this was easier to mark than tweak logic
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const error =
            response?.invalid && !response?.error
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
                : response?.error;

        if (!error) {
            closeDialog();
        }

        setServerError([error]);
        setLoading(false);
    };

    return {
        loading,
        onClick,
    };
}
