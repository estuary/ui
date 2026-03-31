import type { AlertTypeFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useEffect } from 'react';

import { Grid, Skeleton } from '@mui/material';

import { useQuery } from 'urql';

import { AlertTypeQuery } from 'src/api/alerts';
import AlertTypeSelector from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeSelector';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const AlertTypeField = ({ existingAlertTypes }: AlertTypeFieldProps) => {
    const [{ fetching, data, error }] = useQuery({ query: AlertTypeQuery });

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    const setAlertTypes = useAlertSubscriptionsStore(
        (state) => state.setAlertTypes
    );

    useEffect(() => {
        if (!fetching && existingAlertTypes && data?.alertTypes) {
            const existingAlertTypeDefs =
                data.alertTypes.filter(({ alertType }) =>
                    existingAlertTypes.includes(alertType)
                ) ?? [];

            if (existingAlertTypeDefs && existingAlertTypeDefs.length > 0) {
                setAlertTypes(existingAlertTypeDefs);
            }
        }
    }, [data?.alertTypes, existingAlertTypes, fetching, setAlertTypes]);

    useEffect(() => {
        if (error) {
            setServerError([error]);
        }
    }, [error, setServerError]);

    return (
        <Grid
            item
            xs={12}
            sx={{
                maxHeight: 250,
                overflow: 'auto',
                display: 'flex',
            }}
        >
            {fetching || !data ? (
                <Skeleton height={38} width={490} />
            ) : (
                <AlertTypeSelector options={data.alertTypes ?? []} />
            )}
        </Grid>
    );
};

export default AlertTypeField;
