import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useEvaluateSubscriptionIneligibility } from 'src/components/admin/Settings/PrefixAlerts/useEvaluateSubscriptionIneligibility';

const AddButton = () => {
    const intl = useIntl();

    const addTemplatedSubscription = useAlertSubscriptionsStore(
        (state) => state.addTemplatedSubscription
    );
    const { emptyEmailDetected, duplicateSubscriptionEmails } =
        useEvaluateSubscriptionIneligibility();

    console.log(duplicateSubscriptionEmails);

    return (
        <Button
            disabled={
                emptyEmailDetected || duplicateSubscriptionEmails.length > 0
            }
            onClick={() => {
                addTemplatedSubscription();
            }}
            variant="text"
        >
            {intl.formatMessage({
                id: 'alerts.config.dialog.cta.addSubscriber',
            })}
        </Button>
    );
};

export default AddButton;
