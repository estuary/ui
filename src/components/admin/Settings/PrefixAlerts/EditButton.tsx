import { Button } from '@mui/material';
import { getNotificationSubscriptions } from 'api/alerts';
import AlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';
import {
    PrefixSubscriptionDictionary,
    formatNotificationSubscriptionsByPrefix,
} from 'utils/notification-utils';

interface Props {
    prefix: string;
}

const initializeNotificationSubscription = async (prefix: string) => {
    const { data } = await getNotificationSubscriptions(prefix);

    if (data) {
        const processedData = formatNotificationSubscriptionsByPrefix(data);

        return processedData;
    }

    return null;
};

function AlertEditButton({ prefix }: Props) {
    const [open, setOpen] = useState(false);
    const [subscriptions, setSubscriptions] =
        useState<PrefixSubscriptionDictionary | null>(null);

    const openGenerateAlertDialog = async (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.preventDefault();

        const existingSubscriptions = await initializeNotificationSubscription(
            prefix
        );

        setSubscriptions(existingSubscriptions);
        setOpen(true);
    };

    useMount(async () => {
        const existingSubscriptions = await initializeNotificationSubscription(
            prefix
        );

        setSubscriptions(existingSubscriptions);
    });

    return (
        <>
            <Button variant="text" onClick={openGenerateAlertDialog}>
                <FormattedMessage id="cta.edit" />
            </Button>

            {subscriptions === null ? null : (
                <AlertSubscriptionDialog
                    headerId="admin.alerts.dialog.update.header"
                    open={open}
                    setOpen={setOpen}
                    subscriptions={subscriptions}
                    staticPrefix={prefix}
                />
            )}
        </>
    );
}

export default AlertEditButton;
