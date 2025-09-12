import type { AlertingOverviewProps } from 'src/components/home/dashboard/AlertingOverview/types';
import type {
    Alert,
    AlertingOverviewQueryResponse,
    AlertsVariables,
} from 'src/types/gql';

import { useMemo } from 'react';

import { Grid } from '@mui/material';

import { useIntl } from 'react-intl';
import { gql, useQuery } from 'urql';

import AlertSummary from 'src/components/home/dashboard/AlertingOverview/AlertSummary';
import CardWrapper from 'src/components/shared/CardWrapper';
import { useTenantStore } from 'src/stores/Tenant/Store';

const alertingOverviewQuery = gql<
    AlertingOverviewQueryResponse,
    AlertsVariables
>`
    query AlertingOverviewQuery($prefix: String!) {
        alerts(prefix: $prefix, firing: true) {
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

    const [{ fetching, data }] = useQuery({
        query: alertingOverviewQuery,
        variables: { prefix: selectedTenant },
        pause: !selectedTenant,
    });

    const filteredData = useMemo(() => {
        const entityData = data?.alerts?.edges.filter((datum) => {
            return datum.node.alertDetails.spec_type === entityType;
        });

        const response: { [catalogName: string]: Alert[] } = {};

        entityData?.forEach((datum, index) => {
            response[datum.node.catalogName] ??= [];
            response[datum.node.catalogName].push(datum.node);
        });

        return response;
    }, [data?.alerts?.edges, entityType]);

    const filteredDataArray = useMemo(() => {
        return Object.entries(filteredData);
    }, [filteredData]);

    return (
        <Grid item xs={12}>
            <CardWrapper
                opaqueLightMode
                message={intl.formatMessage({
                    id: fetching
                        ? 'alerts.overview.title.fetching'
                        : filteredDataArray.length > 0
                          ? 'alerts.overview.title.active'
                          : 'alerts.overview.title.activeEmpty',
                })}
            >
                <AlertSummary
                    entityType={entityType}
                    fetching={fetching}
                    filteredDataArray={filteredDataArray}
                />
            </CardWrapper>
        </Grid>
    );
}
