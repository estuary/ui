import type { AlertHistoryTableProps } from 'src/components/tables/AlertHistory/types';
import type { TableState } from 'src/types';
import type {
    AlertHistoryForTaskQueryResponse,
    AlertsVariables,
    WithPagination,
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
import { PAGE_INFO_REVERSE_FRAGMENT } from 'src/services/gql';
import { TableStatuses } from 'src/types';
import { evaluateColumnsToShow } from 'src/utils/table-utils';

const PAGE_SIZE = 3;

const alertHistoryForTaskQuery = gql<
    AlertHistoryForTaskQueryResponse,
    WithPagination<AlertsVariables>
>`
    query AlertHistoryForTaskQueryResponse(
        $prefix: String!
        $active: Boolean
        $before: String
        $after: String
        $first: Int
        $last: Int
    ) {
        alerts(
            by: { prefix: $prefix, active: $active }
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
                ...PageInfoReverse
            }
        }
    }
    ${PAGE_INFO_REVERSE_FRAGMENT}
`;

function AlertHistoryTable({
    active,
    disableFooter,
    tablePrefix,
}: AlertHistoryTableProps) {
    const intl = useIntl();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { tableSettings } = useDisplayTableColumns();

    const [currentPage, setCurrentPage] = useState(0);
    const [maxPageSeen, setMaxPageSeen] = useState(0);
    const [beforeCursor, setBeforeCursor] = useState<string | undefined>(
        undefined
    );
    const [afterCursor, setAfterCursor] = useState<string | undefined>(
        undefined
    );

    const [{ fetching, data, error }] = useQuery({
        query: alertHistoryForTaskQuery,
        variables: {
            active,
            prefix: catalogName,

            after: afterCursor,
            before: beforeCursor,

            [!afterCursor ? 'last' : 'first']: PAGE_SIZE,
        },
        pause: !catalogName,
    });

    const loadMore = (_event: any, page: number) => {
        if (page > currentPage) {
            if (data?.alerts?.pageInfo?.endCursor) {
                setMaxPageSeen(Math.max(maxPageSeen, page));
                setAfterCursor(undefined);
                setBeforeCursor(data.alerts.pageInfo.endCursor);
            }
        } else if (page < currentPage) {
            if (page === 0) {
                // Reset to initial state
                setAfterCursor(undefined);
                setBeforeCursor(undefined);
            } else if (data?.alerts?.pageInfo?.startCursor) {
                setAfterCursor(data.alerts.pageInfo.startCursor);
                setBeforeCursor(undefined);
            }
        }
        setCurrentPage(page);
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
    const showFooter = !disableFooter && hasData;
    const isNextButtonDisabled =
        currentPage < maxPageSeen
            ? false
            : !data?.alerts?.pageInfo?.hasPreviousPage;

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

                {showFooter ? (
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={-1}
                                page={currentPage}
                                rowsPerPage={PAGE_SIZE}
                                rowsPerPageOptions={[PAGE_SIZE]}
                                showFirstButton={currentPage !== 0}
                                onPageChange={loadMore}
                                labelDisplayedRows={({ from, to }) => {
                                    return (
                                        <>
                                            {intl.formatMessage(
                                                {
                                                    id: 'alerts.table.pagination.displayedRows',
                                                },
                                                {
                                                    from,
                                                    to,
                                                    status: intl.formatMessage({
                                                        id: active
                                                            ? 'alerts.table.pagination.displayedRows.active'
                                                            : 'alerts.table.pagination.displayedRows.resolved',
                                                    }),
                                                }
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
                                            disabled: isNextButtonDisabled,
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
