import type { SubscriptionDependentProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { Skeleton } from '@mui/material';

import AlertTypeList from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/AlertTypeList';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const AlertTypeField = ({ subscription }: SubscriptionDependentProps) => {
    const alertTypeOptions = useAlertSubscriptionsStore(
        (state) => state.alertTypeOptions
    );
    const alertTypeOptionsFetching = useAlertSubscriptionsStore(
        (state) => state.alertTypeOptionsFetching
    );

    return alertTypeOptionsFetching ? (
        <Skeleton height={38} width={490} />
    ) : (
        <AlertTypeList subscription={subscription} options={alertTypeOptions} />
    );
};

export default AlertTypeField;
