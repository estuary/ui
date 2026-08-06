import type { AlertNode, LiveSpecVariables } from 'src/types/gql';

import { useEffect, useMemo } from 'react';

import { gql, useQuery } from 'urql';

const POLLING_INTERVAL = 45000;

const EMPTY_ALERTS: AlertNode[] = [];

interface ActiveAlertsResponse {
    liveSpecs: {
        edges: { node: { activeAlerts: AlertNode[] } }[];
    };
}

// `alertDetails` is an alias for `arguments`, which is how the rest of the
// codebase reads this field. It is a JSON scalar and takes no sub-selection:
// asking for one failed the whole query with 'Unknown field "alertDetails" on
// type "Alert"'. urql surfaces that as absent data rather than as an error, so
// the panel silently rendered its empty state and had never once shown a real
// alert — the branch had only ever seen it with fixture data.
const ActiveAlertsQuery = gql<ActiveAlertsResponse, LiveSpecVariables>`
    query ActiveAlertsForOverview($catalogName: Name!) {
        liveSpecs(by: { names: [$catalogName] }) {
            edges {
                cursor
                node {
                    activeAlerts {
                        alertType
                        firedAt
                        alertDetails: arguments
                    }
                }
            }
        }
    }
`;

/**
 * The alerts currently firing for a task.
 *
 * Read by Overview and handed to the panel. It lives here rather than inside
 * the panel because the panel is one of several things on the page that may
 * come to want this, and a second caller running the query again would poll
 * the control plane twice for one answer.
 */
function useActiveAlerts(entityName: string) {
    const [{ data, fetching }, reexecuteQuery] = useQuery({
        query: ActiveAlertsQuery,
        variables: { catalogName: entityName },
        pause: !entityName,
    });

    useEffect(() => {
        if (fetching) return;

        const timerId = setTimeout(() => {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }, POLLING_INTERVAL);

        return () => clearTimeout(timerId);
    }, [fetching, reexecuteQuery]);

    const alerts = useMemo(
        () => data?.liveSpecs.edges[0]?.node.activeAlerts ?? EMPTY_ALERTS,
        [data]
    );

    return { alerts, fetching };
}

export default useActiveAlerts;
