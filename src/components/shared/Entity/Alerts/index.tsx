import { gql } from 'urql';

import AlertHistoryTable from 'src/components/tables/AlertHistory';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

const alertHistoryQuery = gql`
    query ($prefixes: [String!]!) {
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
            disableDetailsLink
            querySettings={{
                query: alertHistoryQuery,
                variables: { prefixes: [catalogName] },
                pause: !catalogName,
            }}
        />
    );
}

export default EntityAlerts;
