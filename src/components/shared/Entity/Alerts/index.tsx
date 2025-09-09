import type {
    Alert,
    AlertHistoryQueryResponse,
    AlertsVariables,
    EntityHistoryQueryResponse,
} from 'src/types/gql';

import { useCallback } from 'react';

import { Grid } from '@mui/material';

import { gql } from 'urql';

import CardWrapper from 'src/components/shared/CardWrapper';
import ActiveAlerts from 'src/components/shared/Entity/Details/Alerts/ActiveAlerts';
import NotificationSettings from 'src/components/shared/Entity/Details/Overview/NotificationSettings';
import AlertHistoryTable from 'src/components/tables/AlertHistory';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { TablePrefixes } from 'src/stores/Tables/hooks';

const testQuery = gql<EntityHistoryQueryResponse, AlertsVariables>`
    query EntityAlertsQuery($prefix: String!) {
        capture: captures(prefix: $prefix, firing: true) {
            alerts: alertHistory(last: 10) {
                pageInfo {
                    startCursor
                    endCursor
                }
                nodes {
                    alertType
                    firedAt
                    resolvedAt
                    alertDetails: arguments
                }
            }
        }
        materialization: materializations(prefix: $prefix) {
            alerts: alertHistory(last: 10) {
                pageInfo {
                    startCursor
                    endCursor
                }
                nodes {
                    alertType
                    firedAt
                    resolvedAt
                    alertDetails: arguments
                }
            }
        }
    }
`;

function EntityAlerts() {
    const entityType = useEntityType();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const isCollection = entityType === 'collection';

    const getDataFromResponse = useCallback(
        (data: any): AlertHistoryQueryResponse => {
            if (!data) {
                return {
                    alerts: {
                        edges: [],
                    },
                };
            }

            if (Object.hasOwn(data, entityType)) {
                const response: AlertHistoryQueryResponse = {
                    alerts: {
                        edges: [],
                    },
                };

                response.alerts.edges = data[entityType][0].alerts.edges.filter(
                    (datum: Alert) => Boolean(datum.resolvedAt)
                );

                return response;
            }

            return {
                alerts: {
                    edges: [],
                },
            };
        },
        [entityType]
    );

    return (
        <Grid container spacing={2}>
            <Grid
                item
                xs={12}
                md={!isCollection ? 6 : 12}
                lg={!isCollection ? 8 : 12}
            >
                <ActiveAlerts />
            </Grid>

            {!isCollection && catalogName ? (
                <Grid item xs={12} md={6} lg={4}>
                    <NotificationSettings taskName={catalogName} />
                </Grid>
            ) : null}

            <Grid item xs={12}>
                <CardWrapper message="Resolved Alerts">
                    <AlertHistoryTable
                        getDataFromResponse={getDataFromResponse}
                        tablePrefix={TablePrefixes.alertHistoryForEntity}
                        querySettings={{
                            query: testQuery,
                            variables: { prefix: catalogName },
                            pause: !catalogName,
                        }}
                    />
                </CardWrapper>
            </Grid>
        </Grid>
    );
}

export default EntityAlerts;
