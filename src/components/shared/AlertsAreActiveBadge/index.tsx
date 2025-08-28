import type { AlertsAreActiveBadgeProps } from 'src/components/shared/AlertsAreActiveBadge/types';
import type { AlertsVariables, LatestAlertQueryResponse } from 'src/types/gql';

import { Badge, badgeClasses } from '@mui/material';

import { gql, useQuery } from 'urql';

const LatestAlertQuery = gql<LatestAlertQueryResponse, AlertsVariables>`
    query LatestAlert($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            alertType
        }
    }
`;

function AlertsAreActiveBadge({
    children,
    prefixes,
}: AlertsAreActiveBadgeProps) {
    const [{ fetching, data, error }] = useQuery({
        query: LatestAlertQuery,
        variables: { prefixes },
        pause: !prefixes,
    });

    const activeAlertCount = data?.alerts.length ?? 0;
    const hasActiveAlerts = activeAlertCount > 0;

    return (
        <Badge
            badgeContent={activeAlertCount}
            color={error || hasActiveAlerts ? 'warning' : 'success'}
            invisible={fetching}
            overlap="rectangular"
            // showZero // TODO (Alert History) - decide if we want to show zero or not
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
