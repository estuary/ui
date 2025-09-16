import type { ActiveAlertsProps } from 'src/components/tables/AlertHistory/types';
import type {
    ActiveAlertsForTaskQueryResponse,
    AlertsVariables,
} from 'src/types/gql';

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

const activeAlertsForTaskQuery = gql<
    ActiveAlertsForTaskQueryResponse,
    AlertsVariables
>`
    query ActiveAlertsQuery($prefix: String!) {
        alerts(prefix: $prefix, firing: true) {
            edges {
                node {
                    alertType
                    firedAt
                    catalogName
                    alertDetails: arguments
                    resolvedAt
                }
            }
        }
    }
`;

function ActiveAlerts({}: ActiveAlertsProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const [{ fetching, data, error }] = useQuery({
        query: activeAlertsForTaskQuery,
        variables: { prefix: catalogName },
        pause: !catalogName,
    });

    return (
        <CardWrapper
            message={intl.formatMessage({
                id: 'alerts.overview.title.active',
            })}
            sx={{
                alignItems: 'stretch',
                flexGrow: 1,
            }}
        >
            <Grid
                container
                spacing={{ xs: 2 }}
                justifyContent="start"
                alignItems="stretch"
            >
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
                ) : !data || data.alerts.edges.length === 0 ? (
                    <Grid
                        item
                        xs={12}
                        md={10}
                        lg={8}
                        sx={{
                            alignItems: 'center',
                            justifyItem: 'center',
                        }}
                    >
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
                    data.alerts.edges.map((datum, index) => {
                        return (
                            <Grid
                                item
                                xs={12}
                                lg={4}
                                key={`active_alerts_${datum.node.firedAt}_${index}`}
                                justifyContent="center"
                                alignItems="stretch"
                            >
                                <AlertCard datum={datum.node} />
                            </Grid>
                        );
                    })
                )}
            </Grid>
        </CardWrapper>
    );
}

export default ActiveAlerts;
