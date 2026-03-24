import type { AlertTypeFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useEffect } from 'react';

import { Grid, Skeleton } from '@mui/material';

import { useQuery } from 'urql';

import { AlertTypeQuery } from 'src/api/alerts';
import AlertTypeSelector from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeSelector';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { expandAlertTypeDef } from 'src/utils/misc-utils';

const AlertTypeField = ({ existingAlertTypes }: AlertTypeFieldProps) => {
    const [{ fetching, data, error }] = useQuery({ query: AlertTypeQuery });

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    const setAlertTypes = useAlertSubscriptionsStore(
        (state) => state.setAlertTypes
    );

    useEffect(() => {
        if (!fetching && existingAlertTypes && data?.__type.enumValues) {
            const existingAlertTypeDefs =
                data.__type.enumValues
                    .filter(({ name }) => existingAlertTypes.includes(name))
                    .map(expandAlertTypeDef) ?? [];

            if (existingAlertTypeDefs && existingAlertTypeDefs.length > 0) {
                setAlertTypes(existingAlertTypeDefs);
            }
        }
    }, [data?.__type.enumValues, existingAlertTypes, fetching, setAlertTypes]);

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
                <AlertTypeSelector
                    options={
                        data.__type.enumValues.map(expandAlertTypeDef) ?? []
                    }
                />
            )}
        </Grid>
    );
};

export default AlertTypeField;
