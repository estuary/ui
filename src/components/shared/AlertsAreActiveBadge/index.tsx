import type { AlertsAreActiveBadgeProps } from 'src/components/shared/AlertsAreActiveBadge/types';
import type {
    ActiveAlertCountQueryResponse,
    LiveSpecVariables,
} from 'src/types/gql';

import { useEffect } from 'react';

import { Badge, badgeClasses } from '@mui/material';

import { gql, useQuery } from 'urql';

import { errorMain } from 'src/context/Theme';

const POLLING_INTERVAL = 45000;

const ActiveAlertCountQuery = gql<
    ActiveAlertCountQueryResponse,
    LiveSpecVariables
>`
    query ActiveAlertCount($catalogName: Name!) {
        liveSpecs(by: { names: [$catalogName] }) {
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
            invisible={fetching}
            overlap="rectangular"
            // Sized to sit inside the tab. MUI clips a Tab label three times
            // over — tab, scroller and tabs root all set `overflow: hidden` —
            // and the default 20px badge had its top sliced off by the pill.
            // The scroller's overflow is what makes `variant="scrollable"`
            // scroll, so it cannot be unclipped. The geometry below is tuned
            // against the pill defined in NavigationTabs; the two move together.
            //
            // Colours are set rather than derived from `color="error"`: white
            // measures 4.92:1 on this red, clearing the 4.5 this 10px text
            // needs, but the theme's `contrastThreshold` is 5 so
            // `getContrastText` would reject it and return dark text at 3.94.
            // `errorMain` is also the constant the alerts panel uses.
            sx={{
                [`& .${badgeClasses.badge}`]: {
                    backgroundColor: errorMain,
                    color: '#FFFFFF',
                    fontSize: 10,
                    height: 16,
                    minWidth: 16,
                    px: 0.5,
                    right: -6,
                    top: 2,
                },
            }}
        >
            {children}
        </Badge>
    );
}

export default AlertsAreActiveBadge;
