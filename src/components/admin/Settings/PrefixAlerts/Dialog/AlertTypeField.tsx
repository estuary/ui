import { useEffect } from 'react';

import { Grid, Skeleton } from '@mui/material';

import { useQuery } from 'urql';

import { AlertTypeQuery } from 'src/api/alerts';
import AlertTypeSelector from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeSelector';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const AlertTypeField = () => {
    const [{ fetching, data, error }] = useQuery({ query: AlertTypeQuery });

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    useEffect(() => {
        if (error) {
            setServerError([error]);
        }
    }, [error, setServerError]);

    return (
        <Grid
            item
            xs={12}
            md={7}
            sx={{
                maxHeight: 250,
                overflow: 'auto',
                display: 'flex',
            }}
        >
            {fetching || !data ? (
                <Skeleton height={38} width={490} />
            ) : (
                <AlertTypeSelector options={data.__type.enumValues ?? []} />
            )}
        </Grid>
    );
};

export default AlertTypeField;
