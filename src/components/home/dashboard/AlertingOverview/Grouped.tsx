import type { PostgrestError } from '@supabase/postgrest-js';
import type { Entity } from 'src/types';
import type {
    ActiveAlertsQueryResponse,
    Alert,
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

import { gql, useQuery } from 'urql';

import { authenticatedRoutes } from 'src/app/routes';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import { getTableHeaderWithoutHeaderColor } from 'src/context/Theme';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { getTableComponents } from 'src/utils/table-utils';

interface Props {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageIndeterminate?: boolean;
    monthlyUsageLoading?: boolean;
}

const testQuery = gql<ActiveAlertsQueryResponse, AlertsVariables>`
    query ActiveAlertsQuery($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            alertDetails: arguments
            alertType
            catalogName
            firedAt
            resolvedAt
        }
    }
`;

export default function AlertingOverviewGrouped({ entityType }: Props) {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { tbodyComponent, tdComponent, trComponent, theaderComponent } =
        getTableComponents(false);

    const [{ fetching, data }] = useQuery({
        query: testQuery,
        variables: { prefixes: [selectedTenant] },
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
        const entityData = data?.alerts.filter((datum) => {
            return datum.alertDetails.spec_type === entityType;
        });

        const response: { [catalogName: string]: Alert[] } = {};

        entityData?.forEach((datum, index) => {
            response[datum.catalogName] ??= [];

            response[datum.catalogName].push(datum);
        });

        return response;
    }, [data?.alerts, entityType]);

    return (
        <Grid item xs={12}>
            <CardWrapper message="Alerting Tasks">
                {fetching ? <LinearProgress /> : null}
                {/*{renderedAlerts}*/}
                {Object.entries(filteredData).length > 0 ? (
                    <TableContainer component={Box}>
                        <Table
                            size="small"
                            stickyHeader
                            sx={{
                                ...getTableHeaderWithoutHeaderColor(),
                                'minWidth': 350,
                                '& .MuiTableRow-root': {
                                    height: 45,
                                },
                            }}
                        >
                            <TableHead component={theaderComponent}>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            minWidth: 250,
                                            maxWidth: 'min-content',
                                        }}
                                    >
                                        Task
                                    </TableCell>
                                    <TableCell sx={{ flexGrow: 1 }}>
                                        Active Alerts
                                    </TableCell>
                                    <TableCell sx={{ flexGrow: 1 }}>
                                        Fired At
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody component={tbodyComponent}>
                                {Object.entries(filteredData).map(
                                    ([catalogName, datum], index) => {
                                        console.log('datum', datum);
                                        return (
                                            <>
                                                {datum.map((foo, index) => {
                                                    const {
                                                        humanReadable,
                                                        readableTime,
                                                    } =
                                                        getAlertTypeContent(
                                                            foo
                                                        );

                                                    return (
                                                        <TableRow
                                                            component={
                                                                trComponent
                                                            }
                                                            key={`alert-grouped-${datum[0].catalogName}-${index}`}
                                                        >
                                                            {index === 0 ? (
                                                                <EntityNameLink
                                                                    name={
                                                                        catalogName
                                                                    }
                                                                    showEntityStatus={
                                                                        false
                                                                    }
                                                                    detailsLink={generatePath(
                                                                        {
                                                                            catalog_name:
                                                                                catalogName,
                                                                        }
                                                                    )}
                                                                    entityStatusTypes={[
                                                                        entityType,
                                                                    ]}
                                                                />
                                                            ) : (
                                                                <TableCell />
                                                            )}

                                                            <TableCell
                                                                sx={{
                                                                    flexGrow: 1,
                                                                }}
                                                                component={
                                                                    tdComponent
                                                                }
                                                            >
                                                                <OutlinedChip
                                                                    color="warning"
                                                                    variant="outlined"
                                                                    label={
                                                                        humanReadable
                                                                    }
                                                                />
                                                            </TableCell>

                                                            <TableCell
                                                                sx={{
                                                                    flexGrow: 1,
                                                                }}
                                                                component={
                                                                    tdComponent
                                                                }
                                                            >
                                                                {readableTime}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </>
                                        );
                                    }
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <AlertBox short severity="success">
                        No Alerts!
                    </AlertBox>
                )}
            </CardWrapper>
        </Grid>
    );
}
