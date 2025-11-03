import type { AlertHistoryTableProps } from 'src/components/tables/AlertHistory/types';
import type { TableState } from 'src/types';
import type { AlertNode } from 'src/types/gql';

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

import AlertBox from 'src/components/shared/AlertBox';
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
const MAX_ACTIVE_ALERTS = 5;

interface AlertEdge {
    cursor: string;
    node: AlertNode;
}

interface PageInfo {
    endCursor?: string;
    startCursor?: string;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
}

interface AlertHistoryConnection {
    edges: AlertEdge[];
    pageInfo: PageInfo;
}

interface LiveSpecNode {
    activeAlerts?: AlertNode[];
    alertHistory?: AlertHistoryConnection;
}

interface LiveSpecsQueryResponse {
    liveSpecs: {
        edges: {
            node: LiveSpecNode;
        }[];
    };
}

interface LiveSpecsVariables {
    catalogName: string;
    before?: string;
    first?: number;
}

// Query for active alerts
const activeAlertsQuery = gql<LiveSpecsQueryResponse, LiveSpecsVariables>`
    query ActiveAlertsQuery($catalogName: String!) {
        liveSpecs(by: { names: $catalogName }) {
            edges {
                node {
                    activeAlerts {
                        alertType
                        catalogName
                        alertDetails: arguments
                        firedAt
                    }
                }
            }
        }
    }
`;

// Query for alert history (resolved alerts)
const alertHistoryQuery = gql<LiveSpecsQueryResponse, LiveSpecsVariables>`
    query AlertHistoryQuery(
        $catalogName: String!
        $before: String
        $last: Int
    ) {
        liveSpecs(by: { names: $catalogName }) {
            edges {
                node {
                    alertHistory(before: $before, last: $last) {
                        edges {
                            cursor
                            node {
                                alertType
                                alertDetails: arguments
                                catalogName
                                firedAt
                                resolvedAt
                            }
                        }
                        pageInfo {
                            ...PageInfoReverse
                        }
                    }
                }
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
    // Store cursor history for backward navigation
    const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>(
        []
    );

    const [{ fetching, data, error }] = useQuery({
        query: active ? activeAlertsQuery : alertHistoryQuery,
        variables: {
            catalogName: catalogName,
            ...(active
                ? {}
                : {
                      before: beforeCursor,
                      last: PAGE_SIZE,
                  }),
        },
        pause: !catalogName,
    });

    const loadMore = (_event: any, page: number) => {
        if (page > currentPage) {
            // Moving forward
            const endCursor =
                data?.liveSpecs?.edges?.[0]?.node?.alertHistory?.pageInfo
                    ?.endCursor;
            if (endCursor) {
                setMaxPageSeen(Math.max(maxPageSeen, page));
                setBeforeCursor(endCursor);

                // Store the current cursor in history for the new page
                setCursorHistory((prev) => {
                    const newHistory = [...prev];

                    while (newHistory.length <= page) {
                        newHistory.push(undefined);
                    }
                    newHistory[page] = endCursor;
                    return newHistory;
                });
            }
        } else if (page < currentPage) {
            // Moving backward
            if (page === 0) {
                // Reset to initial state
                setBeforeCursor(undefined);
                setCursorHistory([]);
            } else {
                // See what the history says
                setBeforeCursor(cursorHistory[page]);
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

    // Extract the data based on active prop
    const specNode = data?.liveSpecs?.edges?.[0]?.node;
    const alerts = active
        ? specNode?.activeAlerts
        : specNode?.alertHistory?.edges;
    const pageInfo = active ? null : specNode?.alertHistory?.pageInfo;

    useEffect(() => {
        // Clear any existing timeout
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
        }

        if (fetching) {
            // If this is the first load or we don't have data yet, show loading immediately
            if (!hasLoadedOnce.current || !alerts?.length) {
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
        if (alerts && alerts.length > 0) {
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
    }, [alerts, error, fetching]);

    // Transform active alerts to edges format for consistency
    const alertsAsEdges = useMemo(() => {
        if (!alerts || alerts.length === 0) return [];

        // If active, transform array to edges format
        if (active) {
            return (alerts as AlertNode[])
                .map((alert, index) => ({
                    cursor: `active-${index}`,
                    node: alert,
                }))
                .slice(0, MAX_ACTIVE_ALERTS);
        }

        // Already in edges format for alert history
        return alerts as AlertEdge[];
    }, [alerts, active]);

    const totalActiveAlertsCount = active && alerts ? alerts.length : 0;

    const failed =
        tableState.status === TableStatuses.TECHNICAL_DIFFICULTIES ||
        tableState.status === TableStatuses.NETWORK_FAILED;
    const loading = tableState.status === TableStatuses.LOADING;
    const hasData =
        !failed && !loading && tableState.status === TableStatuses.DATA_FETCHED;
    const showFooter = !disableFooter && !active;
    const isNextButtonDisabled =
        currentPage < maxPageSeen ? false : !pageInfo?.hasPreviousPage;

    return (
        <>
            {active && totalActiveAlertsCount > MAX_ACTIVE_ALERTS ? (
                <AlertBox
                    short
                    sx={{
                        maxWidth: 'fit-content',
                    }}
                    severity="info"
                >
                    {intl.formatMessage(
                        {
                            id: 'alerts.table.reduced',
                        },
                        {
                            count: MAX_ACTIVE_ALERTS,
                            total: totalActiveAlertsCount,
                        }
                    )}
                </AlertBox>
            ) : null}
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350, borderCollapse: 'separate' }}
                    aria-label={intl.formatMessage({
                        id: 'alerts.table.label',
                    })}
                >
                    <EntityTableHeader
                        columns={columnsToShow}
                        selectData={true}
                    />

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
                            hasData && alertsAsEdges.length > 0 ? (
                                <Rows
                                    columns={columnsToShow}
                                    data={alertsAsEdges}
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
                                                        status: intl.formatMessage(
                                                            {
                                                                id: active
                                                                    ? 'alerts.table.pagination.displayedRows.active'
                                                                    : 'alerts.table.pagination.displayedRows.resolved',
                                                            }
                                                        ),
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
        </>
    );
}

export default AlertHistoryTable;
