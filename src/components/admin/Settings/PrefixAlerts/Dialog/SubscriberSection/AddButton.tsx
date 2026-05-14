import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const AddButton = () => {
    const intl = useIntl();

    const addTemplatedSubscription = useAlertSubscriptionsStore(
        (state) => state.addTemplatedSubscription
    );

    return (
        <Button
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
