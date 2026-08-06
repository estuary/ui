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
            color="error"
            invisible={fetching}
            overlap="rectangular"
            // Sized and positioned to sit *inside* the tab. This is only ever
            // rendered into a Tab label, and MUI clips that three times over —
            // `MuiTab-root`, `MuiTabs-scroller` and `MuiTabs-root` all set
            // `overflow: hidden`. At the default 20px and `top: -4` the badge
            // started 6px above the 34px pill and had its top sliced off.
            // Unclipping the ancestors is not an option: the scroller's
            // overflow is what makes `variant="scrollable"` scroll.
            sx={{
                [`& .${badgeClasses.badge}`]: {
                    // `errorMain` explicitly, in both modes, rather than
                    // whatever `color="error"` resolves to. It is the same
                    // constant the alerts panel draws its dot with, so the tab
                    // and the panel finally agree — the badge used to be amber
                    // while the panel beside the chart was red for the same
                    // alerts.
                    //
                    // White is set rather than left to `getContrastText`: on
                    // #CA3B55 white measures 4.92:1, which clears the 4.5 this
                    // 10px text needs, but the theme's `contrastThreshold` is 5
                    // — so MUI would round it down to dark text at 3.94 and
                    // fail. #CA3B55 is also the only red tried that stays
                    // legible on both cards (4.92 light, 3.17 dark); dark
                    // mode's own #E45972 drops white to 3.52.
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
