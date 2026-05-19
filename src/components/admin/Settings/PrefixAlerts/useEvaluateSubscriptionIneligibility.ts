import { useMemo } from 'react';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { hasOwnProperty } from 'src/utils/misc-utils';

export function useEvaluateSubscriptionIneligibility() {
    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );

    return useMemo(() => {
        if (!hasOwnProperty(mutableSubscriptionMetadata, catalogPrefix)) {
            return {
                duplicateSubscriptionEmails: [],
                emptyEmailDetected: false,
            };
        }

        const { subscriptions } = mutableSubscriptionMetadata[catalogPrefix];

        const emptyEmailDetected = subscriptions.some(
            (subscription) => subscription.email.length === 0
        );

        const duplicateSubscriptionEmails = subscriptions
            .filter(({ email }) => {
                const firstIndex = subscriptions.findIndex(
                    (subscription) => subscription.email === email
                );
                const lastIndex = subscriptions.findLastIndex(
                    (subscription) => subscription.email === email
                );

                return firstIndex !== lastIndex;
            })
            .map(({ email }) => email);

        return {
            duplicateSubscriptionEmails,
            emptyEmailDetected,
        };
    }, [catalogPrefix, mutableSubscriptionMetadata]);
}
