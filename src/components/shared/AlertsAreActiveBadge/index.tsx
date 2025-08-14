import type { AlertsAreActiveBadgeProps } from 'src/components/shared/AlertsAreActiveBadge/types';

import { Badge } from '@mui/material';

import { gql, useQuery } from 'urql';

const LatestAlertQuery = gql`
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
    });

    const activeAlertCount = data?.alerts.length ?? 0;
    const hasActiveAlerts = activeAlertCount > 0;

    return (
        <Badge
            badgeContent={activeAlertCount}
            color={error || hasActiveAlerts ? 'warning' : 'success'}
            overlap="rectangular"
            invisible={fetching}
            // TODO (Alert History) - decide if we want to show zero or not
            // showZero
            sx={{
                ['& .MuiBadge-badge']: {
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
