import type {
    Alert,
    AlertHistoryQueryResponse,
    AlertsVariables,
    EntityHistoryQueryResponse,
} from 'src/types/gql';

import { useCallback } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { gql } from 'urql';

import ActiveAlerts from 'src/components/shared/Entity/Details/Alerts/ActiveAlerts';
import AlertHistoryTable from 'src/components/tables/AlertHistory';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { TablePrefixes } from 'src/stores/Tables/hooks';

const testQuery = gql<EntityHistoryQueryResponse, AlertsVariables>`
    query EntityAlertsQuery($prefixes: [String!]!) {
        capture: captures(prefixes: $prefixes) {
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
        materialization: materializations(prefixes: $prefixes) {
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

    const getDataFromResponse = useCallback(
        (data: any): AlertHistoryQueryResponse => {
            if (!data) {
                return { alerts: [] };
            }

            if (Object.hasOwn(data, entityType)) {
                const response: AlertHistoryQueryResponse = {
                    alerts: [],
                };

                response.alerts = data[entityType][0].alerts.nodes.filter(
                    (datum: Alert) => Boolean(datum.resolvedAt)
                );

                return response;
            }

            return { alerts: [] };
        },
        [entityType]
    );

    return (
        <Stack spacing={2}>
            <Box>
                <Typography variant="h6">Active Alerts</Typography>
                <ActiveAlerts />
            </Box>
            <Box>
                <Typography variant="h6">Previous Alerts</Typography>
                <AlertHistoryTable
                    getDataFromResponse={getDataFromResponse}
                    tablePrefix={TablePrefixes.alertHistoryForEntity}
                    querySettings={{
                        query: testQuery,
                        variables: { prefixes: [catalogName] },
                        pause: !catalogName,
                    }}
                />
            </Box>
        </Stack>
    );
}

export default EntityAlerts;
