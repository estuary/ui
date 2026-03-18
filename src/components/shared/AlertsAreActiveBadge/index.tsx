import type { AlertsAreActiveBadgeProps } from 'src/components/shared/AlertsAreActiveBadge/types';
import type {
    ActiveAlertCountQueryResponse,
    LiveSpecVariables,
} from 'src/types/gql';

import { useEffect } from 'react';

import { Badge, badgeClasses } from '@mui/material';

import { gql, useQuery } from 'urql';

const POLLING_INTERVAL = 45000;

const ActiveAlertCountQuery = gql<
    ActiveAlertCountQueryResponse,
    LiveSpecVariables
>`
    query ActiveAlertCount($catalogName: String!) {
        liveSpecs(by: { names: $catalogName }) {
            edges {
                cursor
                node {
                    activeAlerts {
                        alertType
                    }
                }
            }
        }
    }
`;

function AlertsAreActiveBadge({
    children,
    catalogName,
}: AlertsAreActiveBadgeProps) {
    const [{ fetching, data }, reexecuteQuery] = useQuery({
        query: ActiveAlertCountQuery,
        variables: { catalogName },
        pause: !catalogName,
    });

    useEffect(() => {
        if (fetching) return;

        const timerId = setTimeout(() => {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }, POLLING_INTERVAL);

        return () => clearTimeout(timerId);
    }, [fetching, reexecuteQuery]);

    const activeAlertCount =
        data?.liveSpecs.edges[0]?.node.activeAlerts.length ?? 0;

    return (
        <Badge
            badgeContent={activeAlertCount}
            color="warning"
            invisible={fetching}
            overlap="rectangular"
            sx={{
                [`& .${badgeClasses.badge}`]: {
                    right: -6,
                    top: -4,
                },
            }}
        >
            {children}
        </Badge>
    );
}

export default AlertsAreActiveBadge;
