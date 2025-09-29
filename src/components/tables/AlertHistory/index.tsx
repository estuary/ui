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
import { PAGE_INFO_FRAGMENT } from 'src/services/gql';
import { TableStatuses } from 'src/types';
import { evaluateColumnsToShow } from 'src/utils/table-utils';

const resolvedAlertsForTaskQuery = gql<
    ResolvedAlertsForTaskQuery,
    AlertsVariables
>`
    query ResolvedAlertsForTaskQuery($prefix: String!, $before: String) {
        alerts(
            by: { prefix: $prefix, active: false }
            last: 3
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

    const [{ fetching, data, error }] = useQuery({
        query: resolvedAlertsForTaskQuery,
        variables: { prefix: catalogName, before: beforeCursor },
        pause: !catalogName,
    });

    const loadMore = (page: number) => {
        if (page > currentPage) {
            // Next page - use endCursor as the new after cursor
            if (
                data?.alerts?.pageInfo?.hasPreviousPage &&
                data?.alerts?.pageInfo?.endCursor
            ) {
                setBeforeCursor(data.alerts.pageInfo.endCursor);
                setCurrentPage(page);
            }
        } else if (page < currentPage) {
            if (page === 0) {
                setBeforeCursor(undefined);
                setCurrentPage(0);
            } else if (
                data?.alerts?.pageInfo?.hasNextPage &&
                data?.alerts?.pageInfo?.startCursor
            ) {
                setBeforeCursor(data.alerts.pageInfo.startCursor);
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
                                rowsPerPageOptions={[3]}
                                rowsPerPage={3}
                                page={currentPage}
                                onPageChange={(_event, page) => {
                                    loadMore(page);
                                }}
                                showFirstButton
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
                        ) : null}
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    );
}

export default AlertHistoryTable;
