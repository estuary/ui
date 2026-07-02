import { useMemo } from 'react';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

export function useEvaluateSubscriptionIneligibility() {
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );

    return useMemo(() => {
        const { subscriptions } = mutableSubscriptionMetadata;

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
    }, [mutableSubscriptionMetadata]);
}
