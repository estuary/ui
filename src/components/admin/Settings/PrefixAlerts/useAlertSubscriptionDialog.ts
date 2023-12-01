import { getNotificationSubscriptions } from 'api/alerts';
import { useEffect, useState } from 'react';
import {
    PrefixSubscriptionDictionary,
    formatNotificationSubscriptionsByPrefix,
} from 'utils/notification-utils';

const initializeNotificationSubscriptions = async (prefix?: string) => {
    const { data } = await getNotificationSubscriptions(prefix);

    if (data) {
        const processedData = formatNotificationSubscriptionsByPrefix(data);

        return processedData;
    }

    return null;
};

function useAlertSubscriptionDialog(prefix?: string) {
    const [open, setOpen] = useState(false);
    const [subscriptions, setSubscriptions] =
        useState<PrefixSubscriptionDictionary | null>(null);

    const openGenerateAlertDialog = async (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.preventDefault();

        const existingSubscriptions = await initializeNotificationSubscriptions(
            prefix
        );

        setSubscriptions(existingSubscriptions);
        setOpen(true);
    };

    useEffect(() => {
        void (async () => {
            if (open) {
                setSubscriptions(null);

                const existingSubscriptions =
                    await initializeNotificationSubscriptions(prefix);

                setSubscriptions(existingSubscriptions);
            }
        })();
    }, [open, prefix]);

    return { open, openGenerateAlertDialog, setOpen, subscriptions };
}

export default useAlertSubscriptionDialog;
