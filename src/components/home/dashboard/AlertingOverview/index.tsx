import type {
    AlertingOverviewProps,
    FilteredAndGroupedAlerts,
    GroupedAlerts,
} from 'src/components/home/dashboard/AlertingOverview/types';
import type {
    AlertingOverviewQueryResponse,
    AlertsVariables,
} from 'src/types/gql';

import { useMemo } from 'react';

import { Grid } from '@mui/material';

import { useIntl } from 'react-intl';
import { gql, useQuery } from 'urql';

import AlertSummary from 'src/components/home/dashboard/AlertingOverview/AlertSummary';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import { useTenantStore } from 'src/stores/Tenant/Store';

// TODO (GQL) - would like to limit the alertDetails/arguments data
const alertingOverviewQuery = gql<
    AlertingOverviewQueryResponse,
    AlertsVariables
>`
    query AlertingOverviewQuery($prefix: String!, $active: Boolean) {
        alerts(by: { prefix: $prefix, active: $active }) {
            edges {
                node {
                    alertType
                    firedAt
                    catalogName
                    alertDetails: arguments
                    resolvedAt
                }
            }
        }
    }
`;

export default function AlertingOverview({
    entityType,
}: AlertingOverviewProps) {
    const intl = useIntl();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [{ fetching, data, error }] = useQuery({
        query: alertingOverviewQuery,
        variables: { active: true, prefix: selectedTenant },
        pause: !selectedTenant,
    });

    const filteredAndGroupedAlerts = useMemo<FilteredAndGroupedAlerts>(() => {
        const entityData = data?.alerts?.edges.filter((datum) => {
            return datum.node.alertDetails.spec_type === entityType;
        });

        const groupedAlerts: GroupedAlerts = {};
        entityData?.forEach((datum, index) => {
            groupedAlerts[datum.node.catalogName] ??= [];
            groupedAlerts[datum.node.catalogName].push(datum.node);
        });

        return Object.entries(groupedAlerts);
    }, [data?.alerts?.edges, entityType]);

    return (
        <Grid item xs={12}>
            <CardWrapper
                opaqueLightMode
                message={intl.formatMessage({
                    id: fetching
                        ? 'alerts.overview.title.fetching'
                        : filteredAndGroupedAlerts.length > 0
                          ? 'alerts.overview.title.active'
                          : 'alerts.overview.title.activeEmpty',
                })}
            >
                {error ? (
                    <AlertBox short severity="error">
                        {intl.formatMessage({
                            id: 'alert.active.fetchError.title',
                        })}
                    </AlertBox>
                ) : filteredAndGroupedAlerts.length > 0 ? (
                    <AlertSummary
                        entityType={entityType}
                        fetching={fetching}
                        filteredAndGroupedAlerts={filteredAndGroupedAlerts}
                    />
                ) : null}
            </CardWrapper>
        </Grid>
    );
}
