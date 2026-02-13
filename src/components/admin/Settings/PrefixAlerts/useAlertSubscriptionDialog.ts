import { useEffect, useState } from 'react';

import { useQuery } from 'urql';

import { AlertSubscriptionQuery } from 'src/api/alerts';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { formatNotificationSubscriptionsByPrefix } from 'src/utils/notification-utils';

function useAlertSubscriptionDialog(prefix: string) {
    const [{ fetching, data, error }] = useQuery({
        query: AlertSubscriptionQuery,
        variables: { prefix },
    });

    const [open, setOpen] = useState(false);

    const initializeSubscriptionState = useAlertSubscriptionsStore(
        (state) => state.initializeState
    );

    useEffect(() => {
        void (async () => {
            const existingSubscriptions = data
                ? formatNotificationSubscriptionsByPrefix(
                      data.alertSubscriptions
                  )
                : {};

            if (open && !fetching) {
                initializeSubscriptionState(
                    prefix,
                    existingSubscriptions,
                    error
                );
            }
        })();
    }, [data, error, fetching, initializeSubscriptionState, open, prefix]);

    return {
        open,
        setOpen,
    };
}

export default useAlertSubscriptionDialog;
