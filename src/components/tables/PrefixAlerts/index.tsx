import type { ReducedAlertSubscriptionQueryResponse } from 'src/api/types';
import type { TableState } from 'src/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Stack, Table, TableContainer } from '@mui/material';

import { debounce } from 'lodash';
import { useUnmount } from 'react-use';

import AlertGenerateButton from 'src/components/admin/Settings/PrefixAlerts/GenerateButton';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import Rows from 'src/components/tables/PrefixAlerts/Rows';
import { columns } from 'src/components/tables/PrefixAlerts/shared';
import TableFilter from 'src/components/tables/PrefixAlerts/TableFilter';
import { useGetAlertSubscriptions } from 'src/context/AlertSubscriptions';
import { TableStatuses } from 'src/types';

function PrefixAlertTable() {
    const [{ data, error, fetching }, executeQuery] =
        useGetAlertSubscriptions();

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

    const displayLoadingState = useRef(
        debounce(() => setTableState({ status: TableStatuses.LOADING }), 750)
    );

    useUnmount(() => {
        displayLoadingState.current?.cancel();
    });

    useEffect(() => {
        void (async () => {
            if (!fetching) {
                setInitializationError(error);
            }
        })();
    }, [error, fetching, setInitializationError]);

    useEffect(() => {
        if (fetching) {
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
    }, [displayLoadingState, fetching, processedData.length, searchQuery]);

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
                <AlertGenerateButton executeQuery={executeQuery} />

                <TableFilter
                    disabled={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </Stack>

            <TableContainer>
                <Table size="small" sx={{ borderCollapse: 'separate' }}>
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
                            processedData.length > 0 ? (
                                <Rows
                                    data={processedData}
                                    executeQuery={executeQuery}
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
