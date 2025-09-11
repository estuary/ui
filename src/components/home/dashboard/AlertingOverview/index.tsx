import type { PostgrestError } from '@supabase/postgrest-js';
import type { ChipDisplay } from 'src/components/shared/ChipList/types';
import type { Entity } from 'src/types';
import type {
    Alert,
    AlertingOverviewQueryResponse,
    AlertsVariables,
} from 'src/types/gql';

import { useMemo } from 'react';

import {
    Box,
    Grid,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { gql, useQuery } from 'urql';

import { authenticatedRoutes } from 'src/app/routes';
import CardWrapper from 'src/components/shared/CardWrapper';
import ChipList from 'src/components/shared/ChipList';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { getTableComponents } from 'src/utils/table-utils';

interface Props {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageIndeterminate?: boolean;
    monthlyUsageLoading?: boolean;
}

const testQuery = gql<AlertingOverviewQueryResponse, AlertsVariables>`
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

export default function AlertingOverview({ entityType }: Props) {
    const intl = useIntl();

    const { backgroundNesting } = ENTITY_SETTINGS[entityType];

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { tbodyComponent, tdComponent, trComponent, theaderComponent } =
        getTableComponents(false);

    const [{ fetching, data }] = useQuery({
        query: testQuery,
        variables: { prefix: selectedTenant },
        pause: !selectedTenant,
    });

    const getAlertTypeContent = useAlertTypeContent();

    const { generatePath } = useDetailsNavigator(
        entityType === 'capture'
            ? authenticatedRoutes.captures.details.alerts.fullPath
            : entityType === 'materialization'
              ? authenticatedRoutes.materializations.details.alerts.fullPath
              : authenticatedRoutes.collections.details.alerts.fullPath
    );

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

    const bodyContent = useMemo(() => {
        const filteredDataArray = Object.entries(filteredData);

        if (filteredDataArray.length === 0) {
            return null;
        }

        return (
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{
                        minWidth: 300,
                        borderCollapse: 'separate',
                    }}
                    aria-label={intl.formatMessage({
                        id: 'alerts.overview.label',
                    })}
                >
                    <TableHead component={theaderComponent}>
                        <TableRow>
                            <TableCell
                                sx={{
                                    minWidth: 250,
                                    maxWidth: 'min-content',
                                }}
                            >
                                {intl.formatMessage({
                                    id: 'entityName.label',
                                })}
                            </TableCell>
                            <TableCell>
                                {intl.formatMessage({
                                    id: 'alerts.overview.recentAlerts',
                                })}
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody component={tbodyComponent}>
                        {filteredDataArray.map(
                            ([catalogName, datum], index) => {
                                return (
                                    <TableRow
                                        component={trComponent}
                                        key={`alert-${datum[0].catalogName}-${index}`}
                                    >
                                        <EntityNameLink
                                            name={catalogName}
                                            showEntityStatus={false}
                                            detailsLink={generatePath({
                                                catalog_name: catalogName,
                                            })}
                                            entityStatusTypes={[entityType]}
                                        />

                                        <TableCell component={tdComponent}>
                                            <ChipList
                                                forceTooltip
                                                stripPath={false}
                                                values={datum.map(
                                                    (
                                                        alertData
                                                    ): ChipDisplay => {
                                                        const {
                                                            humanReadable,
                                                            firedAtReadable:
                                                                readableTime,
                                                        } =
                                                            getAlertTypeContent(
                                                                alertData
                                                            );

                                                        return {
                                                            display:
                                                                humanReadable,
                                                            title: readableTime,
                                                        };
                                                    }
                                                )}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }, [
        entityType,
        filteredData,
        generatePath,
        getAlertTypeContent,
        intl,
        tbodyComponent,
        tdComponent,
        theaderComponent,
        trComponent,
    ]);

    return (
        <Grid item xs={12}>
            <CardWrapper
                customBackground={backgroundNesting}
                message={intl.formatMessage({
                    id: bodyContent
                        ? 'alerts.overview.title.active'
                        : 'alerts.overview.title.activeEmpty',
                })}
            >
                {fetching ? <LinearProgress /> : null}
                {bodyContent}
            </CardWrapper>
        </Grid>
    );
}
