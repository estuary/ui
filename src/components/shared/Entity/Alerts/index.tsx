import type { AlertHistoryQueryResponse, AlertsVariables } from 'src/types/gql';

import { gql } from 'urql';

import AlertHistoryTable from 'src/components/tables/AlertHistory';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { TablePrefixes } from 'src/stores/Tables/hooks';

const alertHistoryQuery = gql<AlertHistoryQueryResponse, AlertsVariables>`
    query EntityAlertHistory($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            catalogName
            firedAt
            alertType
            alertDetails: arguments
            resolvedAt
        }
    }
`;

function EntityAlerts() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    return (
        <AlertHistoryTable
            tablePrefix={TablePrefixes.alertHistoryForEntity}
            querySettings={{
                query: alertHistoryQuery,
                variables: { prefixes: [catalogName] },
                pause: !catalogName,
            }}
        />
    );
}

export default EntityAlerts;
