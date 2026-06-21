import type { Entity } from 'src/types';
import type {
    AlertingOverviewQueryResponse,
    AlertsVariables,
} from 'src/types/gql';

import { useMemo } from 'react';

import { Box, ButtonBase, Tooltip, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { gql, useQuery } from 'urql';

import useActiveEntityCount from 'src/components/home/dashboard/EntityStatOverview/useActiveEntityCount';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { useTenantStore } from 'src/stores/Tenant';

// A compact health readout for the terminal top bar, mirroring the three
// Welcome-page cards: Sources (captures), Collections, and Destinations
// (materializations). Each shows the active entity count and a status dot —
// green when healthy, amber when the entity type has active alerts.

const HEALTH_ENTITY_TYPES: Entity[] = [
    'capture',
    'collection',
    'materialization',
];

// Active alerts for the selected tenant, counted by entity type. Mirrors the
// dashboard AlertingOverview query so the health dots agree with the cards.
const activeAlertsQuery = gql<AlertingOverviewQueryResponse, AlertsVariables>`
    query EntityHealthAlerts($prefix: String!, $active: Boolean) {
        alerts(by: { prefix: $prefix, active: $active }) {
            edges {
                node {
                    alertType
                    catalogName
                    alertDetails: arguments
                }
            }
        }
    }
`;

function useActiveAlertCountsByType() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [{ fetching, data }] = useQuery({
        query: activeAlertsQuery,
        variables: { active: true, prefix: selectedTenant },
        pause: !selectedTenant,
    });

    const countsByType = useMemo(() => {
        const counts: Partial<Record<Entity, number>> = {};
        data?.alerts?.edges.forEach((edge) => {
            const specType = edge.node.alertDetails?.spec_type as
                | Entity
                | undefined;
            if (specType) {
                counts[specType] = (counts[specType] ?? 0) + 1;
            }
        });
        return counts;
    }, [data?.alerts?.edges]);

    return { countsByType, fetching };
}

function HealthItem({
    entityType,
    alertCount,
    alertsLoading,
}: {
    entityType: Entity;
    alertCount: number;
    alertsLoading: boolean;
}) {
    const theme = useTheme();
    const intl = useIntl();
    const navigate = useNavigate();

    const { count, indeterminate, isLoading } =
        useActiveEntityCount(entityType);
    const {
        Icon,
        termId,
        routes: { viewAll },
    } = ENTITY_SETTINGS[entityType];

    const loading = isLoading || alertsLoading;
    const dotColor = loading
        ? theme.palette.text.disabled
        : alertCount > 0
          ? theme.palette.warning.main
          : count > 0
            ? theme.palette.success.main
            : theme.palette.text.disabled;

    const label = intl.formatMessage({ id: termId });
    const countLabel = loading ? '…' : indeterminate ? `${count}+` : `${count}`;
    const tooltip =
        alertCount > 0
            ? `${label}: ${alertCount} active alert${alertCount === 1 ? '' : 's'}`
            : `${label}: ${countLabel} active, no alerts`;

    return (
        <Tooltip title={tooltip} placement="bottom">
            <ButtonBase
                onClick={() => navigate(viewAll)}
                sx={{
                    'display': 'flex',
                    'alignItems': 'center',
                    'gap': 0.75,
                    'borderRadius': 1,
                    'px': 0.75,
                    'py': 0.25,
                    'minWidth': 0,
                    '&:hover': {
                        background: theme.palette.action.hover,
                    },
                }}
            >
                <Box
                    component="span"
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: dotColor,
                    }}
                />
                <Icon
                    style={{ fontSize: 14, color: theme.palette.text.secondary }}
                />
                <Typography
                    noWrap
                    sx={{ fontSize: 13, color: theme.palette.text.secondary }}
                >
                    {label}
                </Typography>
                <Typography
                    sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                    }}
                >
                    {countLabel}
                </Typography>
            </ButtonBase>
        </Tooltip>
    );
}

export function EntityHealthStrip() {
    const { countsByType, fetching } = useActiveAlertCountsByType();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {HEALTH_ENTITY_TYPES.map((entityType) => (
                <HealthItem
                    key={entityType}
                    entityType={entityType}
                    alertCount={countsByType[entityType] ?? 0}
                    alertsLoading={fetching}
                />
            ))}
        </Box>
    );
}
