import type { AlertSubscriptionCreateMutationInput } from 'src/types/gql';

import { useState } from 'react';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useCreateAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useCreateAlertSubscription';
import { hasLength } from 'src/utils/misc-utils';

export function useUpdateAlertSubscription(closeDialog: () => void) {
    const { createSubscription } = useCreateAlertSubscription();

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    const subscription = useAlertSubscriptionsStore(
        (state) => state.subscription
    );

    const [loading, setLoading] = useState(false);

    const onClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setLoading(true);
        setServerError([]);

        const subscriptionsToCreate: AlertSubscriptionCreateMutationInput[] = [
            {
                alertTypes: subscription.alertTypes,
                email: subscription.email,
                prefix: subscription.catalogPrefix,
            },
        ];

        const subscriptionCreated = createSubscription(subscriptionsToCreate);

        const createResponse = await subscriptionCreated;

        // The create could be undefined and this was easier to mark than tweak logic
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const errors = createResponse
            .filter((r) => r?.error)
            .map((r) => r?.error);

        if (!hasLength(errors)) {
            closeDialog();
        }

        setServerError(errors);
        setLoading(false);
    };

    return { loading, onClick };
}
