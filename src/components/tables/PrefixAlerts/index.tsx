import type { ReducedAlertSubscriptionQueryResponse } from 'src/api/types';
import type { TableState } from 'src/types';
import type { AlertTypeDef } from 'src/types/gql';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Stack, Table, TableContainer } from '@mui/material';

import { debounce } from 'lodash';
import { useUnmount } from 'react-use';
import { useQuery } from 'urql';

import { AlertTypeQuery } from 'src/api/alerts';
import AlertGenerateButton from 'src/components/admin/Settings/PrefixAlerts/GenerateButton';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import Rows from 'src/components/tables/PrefixAlerts/Rows';
import {
    columns,
    TABLE_HEADER_HEIGHT,
    TABLE_ROW_HEIGHT,
} from 'src/components/tables/PrefixAlerts/shared';
import TableFilter from 'src/components/tables/PrefixAlerts/TableFilter';
import { useGetAlertSubscriptions } from 'src/context/AlertSubscriptions';
import { TableStatuses } from 'src/types';

function PrefixAlertTable() {
    const [{ data, error, fetching }] = useGetAlertSubscriptions();

    const [alertTypeResponse] = useQuery({ query: AlertTypeQuery });

    const setInitializationError = useAlertSubscriptionsStore(
        (state) => state.setInitializationError
    );

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const processedData: ReducedAlertSubscriptionQueryResponse['alertSubscriptions'] =
        useMemo(() => {
            if (!data) {
                return [];
            }

            return searchQuery
                ? data.alertSubscriptions.filter(
                      ({ catalogPrefix, email }) =>
                          catalogPrefix.includes(searchQuery) ||
                          email.includes(searchQuery)
                  )
                : data.alertSubscriptions;
        }, [data, searchQuery]);

    const alertTypeDefs: AlertTypeDef[] = useMemo(
        () =>
            !alertTypeResponse.data ? [] : alertTypeResponse.data.alertTypes,
        [alertTypeResponse.data]
    );

    const displayLoadingState = useRef(
        debounce(() => setTableState({ status: TableStatuses.LOADING }), 750)
    );

    useUnmount(() => {
        displayLoadingState.current?.cancel();
    });

    useEffect(() => {
        if (!fetching && !alertTypeResponse.fetching) {
            setInitializationError(error);
        }
    }, [alertTypeResponse.fetching, error, fetching, setInitializationError]);

    useEffect(() => {
        if (fetching || alertTypeResponse.fetching) {
            setTableState({ status: TableStatuses.LOADING });
        } else if (processedData.length > 0) {
            displayLoadingState.current?.cancel();

            setTableState({
                status: TableStatuses.DATA_FETCHED,
            });
        } else {
            displayLoadingState.current?.cancel();

            setTableState({
                status: searchQuery
                    ? TableStatuses.UNMATCHED_FILTER
                    : TableStatuses.NO_EXISTING_DATA,
            });
        }
    }, [
        alertTypeResponse.fetching,
        displayLoadingState,
        fetching,
        processedData.length,
        searchQuery,
    ]);

    const loading = tableState.status === TableStatuses.LOADING;

    return (
        <Box style={{ margin: '0 16px' }}>
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    my: 2,
                }}
            >
                <AlertGenerateButton />

                <TableFilter
                    disabled={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </Stack>

            <TableContainer
                style={{
                    height:
                        processedData.length > 10
                            ? 10 * TABLE_ROW_HEIGHT +
                              TABLE_HEADER_HEIGHT +
                              TABLE_ROW_HEIGHT / 2.5
                            : undefined,
                }}
            >
                <Table
                    size="small"
                    stickyHeader
                    sx={{ borderCollapse: 'separate' }}
                >
                    <EntityTableHeader columns={columns} selectData={true} />

                    <EntityTableBody
                        columns={columns}
                        loading={loading}
                        noExistingDataContentIds={{
                            header: 'alerts.config.table.noContent.header',
                            message: 'alerts.config.table.noContent.message',
                            disableDoclink: true,
                        }}
                        rows={
                            processedData.length > 0 &&
                            alertTypeDefs.length > 0 ? (
                                <Rows
                                    alertTypeDefs={alertTypeDefs}
                                    data={processedData}
                                />
                            ) : null
                        }
                        tableState={tableState}
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default PrefixAlertTable;
