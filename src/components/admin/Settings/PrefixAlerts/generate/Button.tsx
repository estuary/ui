import { Button } from '@mui/material';
import GenerateAlertDialog from 'components/admin/Settings/PrefixAlerts/generate/Dialog';
import useNotificationSubscriptions from 'hooks/notifications/useNotificationSubscriptions';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { PrefixSubscriptionDictionary } from 'utils/notification-utils';

function AlertGenerateButton() {
    const [subscriptions, setSubscriptions] =
        useState<PrefixSubscriptionDictionary | null>(null);
    const [open, setOpen] = useState(false);

    const openGenerateAlertDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(true);
    };

    const { data, isValidating } = useNotificationSubscriptions();

    useEffect(() => {
        if (!isValidating && !isEmpty(data) && subscriptions === null) {
            setSubscriptions(data);
        }
    }, [data, isValidating, setSubscriptions]);

    return subscriptions ? (
        <>
            <Button variant="outlined" onClick={openGenerateAlertDialog}>
                <FormattedMessage id="admin.alerts.cta.addAlertMethod" />
            </Button>

            <GenerateAlertDialog
                open={open}
                setOpen={setOpen}
                subscriptions={subscriptions}
            />
        </>
    ) : null;
}

export default AlertGenerateButton;
