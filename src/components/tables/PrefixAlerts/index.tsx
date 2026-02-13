import type { TableState } from 'src/types';

import { useEffect, useRef, useState } from 'react';

import { Box, Stack, Table, TableContainer } from '@mui/material';

import { debounce } from 'lodash';
import { useUnmount } from 'react-use';
import { useQuery } from 'urql';

import { AlertSubscriptionQuery } from 'src/api/alerts';
import AlertGenerateButton from 'src/components/admin/Settings/PrefixAlerts/GenerateButton';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import Rows from 'src/components/tables/PrefixAlerts/Rows';
import { columns } from 'src/components/tables/PrefixAlerts/shared';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { TableStatuses } from 'src/types';

function PrefixAlertTable() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [{ fetching, data }, executeQuery] = useQuery({
        query: AlertSubscriptionQuery,
        variables: { prefix: selectedTenant },
        pause: !selectedTenant,
    });

    const [searchQuery, _setSearchQuery] = useState<string>('');
    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const displayLoadingState = useRef(
        debounce(() => setTableState({ status: TableStatuses.LOADING }), 750)
    );

    useUnmount(() => {
        displayLoadingState.current?.cancel();
    });

    useEffect(() => {
        if (fetching) {
            setTableState({ status: TableStatuses.LOADING });
        } else if (data && data.alertSubscriptions.length > 0) {
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
    }, [data, displayLoadingState, fetching, searchQuery]);

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
                <AlertGenerateButton
                    executeQuery={executeQuery}
                    fetching={fetching}
                />
            </Stack>

            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350, borderCollapse: 'separate' }}
                >
                    <EntityTableHeader columns={columns} selectData={true} />

                    <EntityTableBody
                        columns={columns}
                        noExistingDataContentIds={{
                            header: 'alerts.config.table.noContent.header',
                            message: 'alerts.config.table.noContent.message',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={loading}
                        rows={
                            data && data.alertSubscriptions.length > 0 ? (
                                <Rows data={data.alertSubscriptions} />
                            ) : null
                        }
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default PrefixAlertTable;
