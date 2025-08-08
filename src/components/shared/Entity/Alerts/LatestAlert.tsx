import { gql, useQuery } from 'urql';

import AlertBox from 'src/components/shared/AlertBox';

const LatestAlertQuery = gql`
    query ($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            alertType
        }
    }
`;

function LatestAlert({ taskName }: any) {
    const [{ fetching, data, error }] = useQuery({
        query: LatestAlertQuery,
        variables: { prefixes: [taskName] },
    });

    if (fetching) {
        return null;
    }

    if (error) {
        return null;
    }

    const noAlerts = !data.alerts || data.alerts.length < 1;

    return (
        <AlertBox
            short
            severity={noAlerts ? 'success' : 'error'}
            title={noAlerts ? 'All Good' : 'Latest Alert'}
        >
            {noAlerts ? 'No recent alerts' : data.alerts[0].alertType}
        </AlertBox>
    );
}

export default LatestAlert;
