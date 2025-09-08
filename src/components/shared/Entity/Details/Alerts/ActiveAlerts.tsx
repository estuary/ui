import type { ActiveAlertsProps } from 'src/components/tables/AlertHistory/types';
import type { ActiveAlertsQueryResponse, AlertsVariables } from 'src/types/gql';

import { Grid, Skeleton } from '@mui/material';

import { useIntl } from 'react-intl';
import { gql, useQuery } from 'urql';

import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCard from 'src/components/shared/Entity/Details/Alerts/AlertCard';
import Message from 'src/components/shared/Error/Message';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

const testQuery = gql<ActiveAlertsQueryResponse, AlertsVariables>`
    query ActiveAlertsQuery($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            alertDetails: arguments
            alertType
            catalogName
            firedAt
            resolvedAt
        }
    }
`;

function ActiveAlerts({}: ActiveAlertsProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const [{ fetching, data, error }] = useQuery({
        query: testQuery,
        variables: { prefixes: [catalogName] },
        pause: !catalogName,
    });

    return (
        <CardWrapper message="Unresolved Alerts">
            <Grid container spacing={{ xs: 2 }}>
                {fetching ? (
                    // TODO (alerts) - need to make a proper skeleton of cards
                    <>
                        <Grid item xs={4}>
                            <Skeleton height={275} />
                        </Grid>
                        <Grid item xs={4}>
                            <Skeleton height={275} style={{ opacity: 0.66 }} />
                        </Grid>
                        <Grid item xs={4}>
                            <Skeleton height={275} style={{ opacity: 0.33 }} />
                        </Grid>
                    </>
                ) : error ? (
                    <Grid item xs={12} md={10} lg={8}>
                        <AlertBox
                            severity="error"
                            short
                            title={intl.formatMessage({
                                id: 'alert.active.fetchError.title',
                            })}
                        >
                            <Message error={error} />
                        </AlertBox>
                    </Grid>
                ) : !data || data.alerts.length === 0 ? (
                    <Grid item xs={12} md={10} lg={8}>
                        <AlertBox
                            severity="success"
                            short
                            title={intl.formatMessage({
                                id: 'alert.active.noAlerts.title',
                            })}
                        >
                            {intl.formatMessage({
                                id: 'alert.active.noAlerts.message',
                            })}
                        </AlertBox>
                    </Grid>
                ) : (
                    data.alerts.map((datum, index) => {
                        return (
                            <Grid
                                item
                                xs={12}
                                lg={4}
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
