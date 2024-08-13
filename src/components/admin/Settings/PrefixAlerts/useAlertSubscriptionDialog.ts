import { getNotificationSubscriptions } from 'api/alerts';
import { useEffect, useState } from 'react';
import { formatNotificationSubscriptionsByPrefix } from 'utils/notification-utils';
import useAlertSubscriptionsStore from './useAlertSubscriptionsStore';

export const initializeNotificationSubscriptions = async (prefix?: string) => {
    const { data, error } = await getNotificationSubscriptions(prefix);

    if (data) {
        return { data: formatNotificationSubscriptionsByPrefix(data), error };
    }

    return { data: null, error };
};

function useAlertSubscriptionDialog(prefix?: string) {
    const [open, setOpen] = useState(false);

    const initializeSubscriptionState = useAlertSubscriptionsStore(
        (state) => state.initializeState
    );

    useEffect(() => {
        void (async () => {
            if (open) {
                const { data: existingSubscriptions, error } =
                    await initializeNotificationSubscriptions(prefix);

                initializeSubscriptionState(
                    prefix,
                    existingSubscriptions,
                    error
                );
            }
        })();
    }, [initializeSubscriptionState, open, prefix]);

    return {
        open,
        setOpen,
    };
}

export default useAlertSubscriptionDialog;
