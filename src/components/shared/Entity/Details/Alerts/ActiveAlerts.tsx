import type { ActiveAlertsProps } from 'src/components/tables/AlertHistory/types';
import type { ActiveAlertsQueryResponse, AlertsVariables } from 'src/types/gql';

import { Grid, LinearProgress } from '@mui/material';

import { gql, useQuery } from 'urql';

import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCard from 'src/components/shared/Entity/Details/Alerts/AlertCard';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

const testQuery = gql<ActiveAlertsQueryResponse, AlertsVariables>`
    query ActiveAlertsQuery($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            alertType
            alertDetails: arguments
            catalogName
            firedAt
            resolvedAt
        }
    }
`;

function ActiveAlerts({}: ActiveAlertsProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const [{ fetching, data, error }] = useQuery({
        query: testQuery,
        variables: { prefixes: [catalogName] },
        pause: !catalogName,
    });

    if (fetching) {
        return <LinearProgress />;
    }

    return (
        <CardWrapper message="Active Alerts">
            <Grid container spacing={{ xs: 2 }}>
                {error ? (
                    <Grid item xs={12} md={3}>
                        <AlertBox short severity="error">
                            {error.message}
                        </AlertBox>
                    </Grid>
                ) : !data || data.alerts.length === 0 ? (
                    <Grid item xs={12} md={3}>
                        <AlertBox short severity="success">
                            No Active Alerts
                        </AlertBox>
                    </Grid>
                ) : (
                    data.alerts.map((datum, index) => {
                        return (
                            <Grid
                                item
                                xs={12}
                                md={6}
                                key={`active_alerts_${datum.firedAt}_${index}`}
                            >
                                <AlertCard datum={datum} />
                            </Grid>
                        );
                    })
                )}
            </Grid>
        </CardWrapper>
    );
}

export default ActiveAlerts;
