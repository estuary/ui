import type { AlertTypeFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';

import { useEffect } from 'react';

import { Skeleton } from '@mui/material';

import AlertTypeSelector from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeSelector';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useGetAlertTypes } from 'src/context/AlertType';

const DEFAULT_OPTIONS: AlertTypeInfo[] = [];

const AlertTypeField = ({ subscription }: AlertTypeFieldProps) => {
    const [{ fetching, data, error }] = useGetAlertTypes();

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    useEffect(() => {
        if (error) {
            setServerError([error]);
        }
    }, [error, setServerError]);

    return fetching || !data ? (
        <Skeleton height={38} width={490} />
    ) : (
        <AlertTypeSelector
            subscription={subscription}
            options={data.alertTypes ?? DEFAULT_OPTIONS}
        />
    );
};

export default AlertTypeField;
