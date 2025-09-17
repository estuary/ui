import type { AlertsAreActiveBadgeProps } from 'src/components/shared/AlertsAreActiveBadge/types';
import type { AlertsVariables, LatestAlertQueryResponse } from 'src/types/gql';

import { useEffect } from 'react';

import { Badge, badgeClasses } from '@mui/material';

import { gql, useQuery } from 'urql';

const LatestAlertQuery = gql<LatestAlertQueryResponse, AlertsVariables>`
    query LatestAlert($prefix: String!) {
        alerts(prefix: $prefix, firing: true) {
            edges {
                cursor
            }
        }
    }
`;

const POLLING_INTERVAL = 10000;

function AlertsAreActiveBadge({ children, prefix }: AlertsAreActiveBadgeProps) {
    const [{ fetching, data, error }, reexecuteQuery] = useQuery({
        query: LatestAlertQuery,
        variables: { prefix },
        pause: !prefix,
    });

    useEffect(() => {
        if (fetching) return;

        // Set up to refetch in one second, if the query is idle
        const timerId = setTimeout(() => {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }, POLLING_INTERVAL);

        return () => clearTimeout(timerId);
    }, [fetching, reexecuteQuery]);

    const activeAlertCount = data?.alerts.edges.length ?? 0;
    const hasActiveAlerts = activeAlertCount > 0;

    return (
        <Badge
            badgeContent={activeAlertCount}
            color={error || hasActiveAlerts ? 'warning' : 'success'}
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
