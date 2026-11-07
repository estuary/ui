import { Button } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useEvaluateSubscriptionIneligibility } from 'src/components/admin/Settings/PrefixAlerts/useEvaluateSubscriptionIneligibility';

const AddButton = () => {
    const { ref: semanticAddSubscriberRef } =
        useSemanticLeaf<HTMLButtonElement>('Add Subscriber');

    const addTemplatedSubscription = useAlertSubscriptionsStore(
        (state) => state.addTemplatedSubscription
    );
    const duplicatePrefixExists = useAlertSubscriptionsStore(
        (state) => state.duplicatePrefixExists
    );

    const { emptyEmailDetected, duplicateSubscriptionEmails } =
        useEvaluateSubscriptionIneligibility();

    return (
        <Button
            ref={semanticAddSubscriberRef}
            disabled={
                duplicatePrefixExists ||
                emptyEmailDetected ||
                duplicateSubscriptionEmails.length > 0
            }
            onClick={() => {
                addTemplatedSubscription();
            }}
            variant="text"
        >
            Add Recipient
        </Button>
    );
};

export default AddButton;
