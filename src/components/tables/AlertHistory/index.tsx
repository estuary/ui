import type { AlertHistoryTableProps } from 'src/components/tables/AlertHistory/types';
import type { TableState } from 'src/types';
import type {
    AlertsVariables,
    ResolvedAlertsForTaskQuery,
} from 'src/types/gql';

import { useEffect, useMemo, useState } from 'react';

import {
    Box,
    Table,
    TableContainer,
    TableFooter,
    TablePagination,
    TableRow,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { gql, useQuery } from 'urql';

import Rows from 'src/components/tables/AlertHistory/Rows';
import {
    optionalColumns,
    tableColumns,
} from 'src/components/tables/AlertHistory/shared';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { useDisplayTableColumns } from 'src/context/TableSettings';
import { semiTransparentBackground } from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { TableStatuses } from 'src/types';
import { evaluateColumnsToShow } from 'src/utils/table-utils';

const resolvedAlertsForTaskQuery = gql<
    ResolvedAlertsForTaskQuery,
    AlertsVariables
>`
    query ResolvedAlertsForTaskQuery($prefix: String!, $before: String) {
        alerts(
            by: { prefix: $prefix, active: false }
            last: 2
            before: $before
        ) {
            edges {
                cursor
                node {
                    alertType
                    alertDetails: arguments
                    firedAt
                    catalogName
                    resolvedAt
                }
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
`;

function AlertHistoryTable({ tablePrefix }: AlertHistoryTableProps) {
    const intl = useIntl();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { tableSettings } = useDisplayTableColumns();

    const columnsToShow = useMemo(
        () =>
            evaluateColumnsToShow(
                optionalColumns,
                tableColumns,
                tablePrefix,
                tableSettings
            ),
        [tablePrefix, tableSettings]
    );

    // Get the data from the server
    const [{ fetching, data, error }, executeQuery] = useQuery({
        query: resolvedAlertsForTaskQuery,
        variables: { prefix: catalogName },
        pause: !catalogName,
    });

    console.log('fetching >>>', fetching);
    console.log('data >>> ', data);

    const loadMore = () => {
        console.log('loadMore >>>');
        if (data?.alerts?.pageInfo?.hasPreviousPage) {
            console.log('loadMore execute >>>');

            executeQuery({
                requestPolicy: 'cache-and-network',
                variables: {
                    prefix: catalogName,
                    before: data.alerts.pageInfo.startCursor,
                },
            });
        }
    };

    // Manage table state
    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });
    useEffect(() => {
        if (fetching) {
            setTableState({ status: TableStatuses.LOADING });
            return;
        }

        if (error) {
            if (error.networkError) {
                setTableState({ status: TableStatuses.NETWORK_FAILED });
            } else {
                setTableState({ status: TableStatuses.TECHNICAL_DIFFICULTIES });
            }
            return;
        }
        if (data?.alerts?.edges && data.alerts.edges.length > 0) {
            setTableState({
                status: TableStatuses.DATA_FETCHED,
            });
            return;
        }

        setTableState({
            status: TableStatuses.NO_EXISTING_DATA,
        });
    }, [data, error, fetching]);

    const failed =
        tableState.status === TableStatuses.TECHNICAL_DIFFICULTIES ||
        tableState.status === TableStatuses.NETWORK_FAILED;
    const loading = tableState.status === TableStatuses.LOADING;
    const hasData =
        !failed && !loading && tableState.status === TableStatuses.DATA_FETCHED;

    return (
        <TableContainer component={Box}>
            <Table
                size="small"
                sx={{ minWidth: 350, borderCollapse: 'separate' }}
                aria-label={intl.formatMessage({
                    id: 'alerts.table.label',
                })}
            >
                <EntityTableHeader columns={columnsToShow} selectData={true} />

                <EntityTableBody
                    columns={columnsToShow}
                    noExistingDataContentIds={{
                        header: 'alerts.table.empty.header',
                        message: failed
                            ? 'alerts.table.error.message'
                            : 'alerts.table.empty.message',
                        disableDoclink: true,
                    }}
                    tableState={tableState}
                    loading={loading}
                    rows={
                        hasData && data?.alerts?.edges ? (
                            <Rows
                                columns={columnsToShow}
                                data={data.alerts.edges}
                            />
                        ) : null
                    }
                />

                <TableFooter>
                    <TableRow
                        sx={{
                            bgcolor: (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                        }}
                    >
                        {hasData ? (
                            <TablePagination
                                count={-1}
                                rowsPerPageOptions={[2]}
                                rowsPerPage={2}
                                page={0}
                                onPageChange={(_event, page) => {
                                    console.log('onPageChange', page);
                                    loadMore();
                                }}
                            />
                        ) : null}
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    );
}

export default AlertHistoryTable;
