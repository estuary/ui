import { Button } from '@mui/material';
import { getNotificationSubscriptions } from 'api/alerts';
import GenerateAlertDialog from 'components/admin/Settings/PrefixAlerts/generate/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';
import {
    PrefixSubscriptionDictionary,
    formatNotificationSubscriptionsByPrefix,
} from 'utils/notification-utils';

const initializeNotificationSubscriptions = async () => {
    const { data } = await getNotificationSubscriptions();

    if (data) {
        const processedData = formatNotificationSubscriptionsByPrefix(data);

        return processedData;
    }

    return null;
};

function AlertGenerateButton() {
    const [open, setOpen] = useState(false);
    const [subscriptions, setSubscriptions] =
        useState<PrefixSubscriptionDictionary | null>(null);

    const openGenerateAlertDialog = async (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.preventDefault();

        const existingSubscriptions =
            await initializeNotificationSubscriptions();

        setSubscriptions(existingSubscriptions);
        setOpen(true);
    };

    useMount(async () => {
        const existingSubscriptions =
            await initializeNotificationSubscriptions();

        setSubscriptions(existingSubscriptions);
    });

    return (
        <>
            <Button
                disabled={subscriptions === null}
                variant="outlined"
                onClick={openGenerateAlertDialog}
            >
                <FormattedMessage id="admin.alerts.cta.addAlertMethod" />
            </Button>

            {subscriptions === null ? null : (
                <GenerateAlertDialog
                    open={open}
                    setOpen={setOpen}
                    subscriptions={subscriptions}
                />
            )}
        </>
    );
}

export default AlertGenerateButton;
