import { gql, useQuery } from 'urql';

import AlertBox from 'src/components/shared/AlertBox';
import AlertTypeContent from 'src/components/tables/AlertHistory/AlertTypeContent';

const LatestAlertQuery = gql`
    query LatestAlert($prefixes: [String!]!) {
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

    const alertCount = data?.alerts?.length ?? 0;

    return (
        <AlertBox
            short
            severity={alertCount > 0 ? 'error' : 'success'}
            title={
                alertCount === 0
                    ? 'All Good'
                    : alertCount === 1
                      ? 'Unresolved Alert'
                      : 'Unresolved Alerts'
            }
        >
            {alertCount > 0 ? (
                <AlertTypeContent alertType={data.alerts[0].alertType} />
            ) : (
                'No unresolved alerts'
            )}
        </AlertBox>
    );
}

export default LatestAlert;
