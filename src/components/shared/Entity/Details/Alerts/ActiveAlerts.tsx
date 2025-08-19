import type { ActiveAlertsProps } from 'src/components/tables/AlertHistory/types';
import type { ActiveAlertsQueryResponse, AlertsVariables } from 'src/types/gql';

import { Grid, LinearProgress } from '@mui/material';

import { gql, useQuery } from 'urql';

import AlertBox from 'src/components/shared/AlertBox';
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

    if (error) {
        return (
            <AlertBox
                short
                title="failed to fetch active alerts"
                severity="error"
            />
        );
    }

    return (
        <Grid container columns={{ xs: 4, md: 12 }} spacing={{ xs: 2 }}>
            {!data || data.alerts.length === 0 ? (
                <Grid item xs={12} md={3}>
                    <AlertBox short severity="success">
                        No Active Alerts
                    </AlertBox>
                </Grid>
            ) : (
                data.alerts.map((datum: any) => {
                    return (
                        <Grid
                            item
                            xs={12}
                            md={3}
                            key={`active_alerts_${datum.firedAt}`}
                        >
                            <AlertCard datum={datum} />
                        </Grid>
                    );
                })
            )}
        </Grid>
    );
}

export default ActiveAlerts;
