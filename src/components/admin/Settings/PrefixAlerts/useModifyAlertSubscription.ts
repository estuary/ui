import type { AlertSubscriptionCreateMutationInput } from 'src/types/gql';

import { useRef, useState } from 'react';

import { debounce } from 'lodash';
import { useUnmount } from 'react-use';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useCreateAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useCreateAlertSubscription';
import { hasLength } from 'src/utils/misc-utils';
import { DEFAULT_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

export function useModifyAlertSubscription(closeDialog: () => void) {
    const debounceDialogClosure = useRef(
        debounce(() => {
            closeDialog();
        }, DEFAULT_DEBOUNCE_WAIT)
    );

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
            debounceDialogClosure.current();
        }

        setServerError(errors);
        setLoading(false);
    };

    useUnmount(() => {
        debounceDialogClosure.current?.cancel();
    });

    return { loading, onClick };
}
