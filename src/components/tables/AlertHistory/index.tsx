import type { AlertHistoryTableProps } from 'src/components/tables/AlertHistory/types';
import type { TableState } from 'src/types';
import type {
    AlertsVariables,
    ResolvedAlertsForTaskQuery,
} from 'src/types/gql';

import { useEffect, useMemo, useRef, useState } from 'react';

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
    ALERT_HISTORY_LOADING_DELAY,
    optionalColumns,
    tableColumns,
} from 'src/components/tables/AlertHistory/shared';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { useDisplayTableColumns } from 'src/context/TableSettings';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { PAGE_INFO_FRAGMENT } from 'src/services/gql';
import { TableStatuses } from 'src/types';
import { evaluateColumnsToShow } from 'src/utils/table-utils';

const PAGE_SIZE = 3;

const resolvedAlertsForTaskQuery = gql<
    ResolvedAlertsForTaskQuery,
    AlertsVariables
>`
    query ResolvedAlertsForTaskQuery(
        $prefix: String!
        $before: String
        $after: String
        $first: Int
        $last: Int
    ) {
        alerts(
            by: { prefix: $prefix, active: false }
            first: $first
            last: $last
            after: $after
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
                ...PageInfo
            }
        }
    }
    ${PAGE_INFO_FRAGMENT}
`;

function AlertHistoryTable({ tablePrefix }: AlertHistoryTableProps) {
    const intl = useIntl();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { tableSettings } = useDisplayTableColumns();

    const [currentPage, setCurrentPage] = useState(0);
    const [beforeCursor, setBeforeCursor] = useState<string | undefined>(
        undefined
    );
    const [afterCursor, setAfterCursor] = useState<string | undefined>(
        undefined
    );
    const [paginationDirection, setPaginationDirection] = useState<
        'first' | 'last'
    >('last');

    const [{ fetching, data, error }] = useQuery({
        query: resolvedAlertsForTaskQuery,
        variables: {
            prefix: catalogName,
            before: beforeCursor,
            after: afterCursor,
            [paginationDirection]: PAGE_SIZE,
        },
        pause: !catalogName,
    });

    const updatePaginationState = (direction: any, after: any, before: any) => {
        setAfterCursor(after);
        setBeforeCursor(before);
        setPaginationDirection(direction);
    };

    const loadMore = (page: number) => {
        if (page > currentPage) {
            // Next page - use endCursor as the new after cursor and paginate backward
            if (data?.alerts?.pageInfo?.endCursor) {
                updatePaginationState(
                    'last',
                    undefined,
                    data.alerts.pageInfo.endCursor
                );
                setCurrentPage(page);
            }
        } else if (page < currentPage) {
            if (page === 0) {
                updatePaginationState('last', undefined, undefined);
                setCurrentPage(0);
            } else if (data?.alerts?.pageInfo?.startCursor) {
                updatePaginationState(
                    'first',
                    data.alerts.pageInfo.startCursor,
                    undefined
                );
                setCurrentPage(page);
            }
        }
    };

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

    // Track if this is the first load
    const hasLoadedOnce = useRef(false);
    const loadingTimeoutRef = useRef<number | null>(null);

    // Manage table state
    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    useEffect(() => {
        // Clear any existing timeout
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
        }

        if (fetching) {
            // If this is the first load or we don't have data yet, show loading immediately
            if (!hasLoadedOnce.current || !data?.alerts?.edges?.length) {
                setTableState({ status: TableStatuses.LOADING });
            } else {
                // For subsequent loads, wait 100ms before showing loading state
                loadingTimeoutRef.current = window.setTimeout(() => {
                    setTableState({ status: TableStatuses.LOADING });
                }, ALERT_HISTORY_LOADING_DELAY);
            }
            return;
        }

        // Mark that we've completed at least one load
        hasLoadedOnce.current = true;

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

        // Cleanup timeout on unmount
        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
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

                {hasData ? (
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={-1}
                                rowsPerPageOptions={[PAGE_SIZE]}
                                rowsPerPage={PAGE_SIZE}
                                page={currentPage}
                                onPageChange={(_event, page) => {
                                    loadMore(page);
                                }}
                                showFirstButton={currentPage !== 0}
                                labelDisplayedRows={({ from, to }) => {
                                    return (
                                        <>
                                            {intl.formatMessage(
                                                {
                                                    id: 'alerts.table.pagination.displayedRows',
                                                },
                                                { from, to }
                                            )}
                                        </>
                                    );
                                }}
                                slotProps={{
                                    actions: {
                                        previousButton: {
                                            disabled: currentPage === 0,
                                        },
                                        nextButton: {
                                            disabled:
                                                !data?.alerts?.pageInfo
                                                    ?.hasPreviousPage,
                                        },
                                    },
                                }}
                            />
                        </TableRow>
                    </TableFooter>
                ) : null}
            </Table>
        </TableContainer>
    );
}

export default AlertHistoryTable;
