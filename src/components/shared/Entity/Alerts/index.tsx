import type {
    AlertsVariables,
    EntityHistoryQueryResponse,
} from 'src/types/gql';

import { useCallback } from 'react';

import { gql } from 'urql';

import AlertHistoryTable from 'src/components/tables/AlertHistory';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { TablePrefixes } from 'src/stores/Tables/hooks';

const testQuery = gql<EntityHistoryQueryResponse, AlertsVariables>`
    query CaptureAlertsQuery($prefixes: [String!]!) {
        capture: captures(prefixes: $prefixes) {
            alerts: firingAlerts {
                alertType
                firedAt
                resolvedAt
                alertDetails: arguments
            }
        }
        materialization: materializations(prefixes: $prefixes) {
            alerts: firingAlerts {
                alertType
                firedAt
                resolvedAt
                alertDetails: arguments
            }
        }
    }
`;

function EntityAlerts() {
    const entityType = useEntityType();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const getDataFromResponse = useCallback(
        (data: any) => {
            if (!data) {
                return [];
            }

            if (Object.hasOwn(data, entityType)) {
                return data[entityType][0];
            }

            return [];
        },
        [entityType]
    );

    return (
        <AlertHistoryTable
            getDataFromResponse={getDataFromResponse}
            tablePrefix={TablePrefixes.alertHistoryForEntity}
            querySettings={{
                query: testQuery,
                variables: { prefixes: [catalogName] },
                pause: !catalogName,
            }}
        />
    );
}

export default EntityAlerts;
