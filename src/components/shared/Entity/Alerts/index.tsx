import { gql, useQuery } from 'urql';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { stringifyJSON } from 'src/services/stringify';

const AlertHistoryQuery = gql`
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

    const [{ fetching, data, error }] = useQuery({
        query: AlertHistoryQuery,
        variables: { prefixes: [catalogName] },
        pause: !catalogName,
    });

    if (fetching) {
        return <>fetching</>;
    }

    if (error) {
        return <>error</>;
    }

    return (
        <textarea rows={20} cols={75}>
            {stringifyJSON(data)}
        </textarea>
    );
}

export default EntityAlerts;
