import type { AlertsAreActiveBadgeProps } from 'src/components/shared/AlertsAreActiveBadge/types';
import type {
    ActiveAlertCountQueryResponse,
    AlertsVariables,
} from 'src/types/gql';

import { useEffect } from 'react';

import { Badge, badgeClasses } from '@mui/material';

import { gql, useQuery } from 'urql';

const POLLING_INTERVAL = 10000;

const ActiveAlertCountQuery = gql<
    ActiveAlertCountQueryResponse,
    AlertsVariables
>`
    query ActiveAlertCount($prefix: String!) {
        alerts(prefix: $prefix, active: true) {
            edges {
                cursor
            }
        }
    }
`;

function AlertsAreActiveBadge({ children, prefix }: AlertsAreActiveBadgeProps) {
    const [{ fetching, data }, reexecuteQuery] = useQuery({
        query: ActiveAlertCountQuery,
        variables: { prefix },
        pause: !prefix,
    });

    useEffect(() => {
        if (fetching) return;

        const timerId = setTimeout(() => {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }, POLLING_INTERVAL);

        return () => clearTimeout(timerId);
    }, [fetching, reexecuteQuery]);

    const activeAlertCount = data?.alerts.edges.length ?? 0;

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
