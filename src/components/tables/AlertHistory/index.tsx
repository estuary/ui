import type { AlertHistoryTableProps } from 'src/components/tables/AlertHistory/types';
import type { TableColumns, TableState } from 'src/types';

import { useEffect, useState } from 'react';

import { Box, Table, TableContainer } from '@mui/material';

import { useIntl } from 'react-intl';
import { useQuery } from 'urql';

import Rows from 'src/components/tables/AlertHistory/Rows';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { TableStatuses } from 'src/types';

// TODO (optimization): The prefix alert table should have a last updated column
//   however the current data model does not provide a means to reliably track
//   when the emails subscribed to alerts under a given prefix were last updated.
//   If the most recently subscribed email for a given prefix is removed,
//   the latest `updated_at` value would be rolling back in time.
const columns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.details',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.alertType',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.recipients',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.firedAt',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.resolvedAt',
    },
];

function AlertHistoryTable({
    querySettings,
    disableDetailsLink,
}: AlertHistoryTableProps) {
    const intl = useIntl();

    // Get the data from the server
    const [{ fetching, data, error }] = useQuery(querySettings);

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
        if (data?.alerts?.length > 0) {
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
        <Box>
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350, borderCollapse: 'separate' }}
                    aria-label={intl.formatMessage({
                        id: 'admin.notifications.table.label',
                    })}
                >
                    <EntityTableHeader columns={columns} selectData={true} />

                    <EntityTableBody
                        columns={columns}
                        noExistingDataContentIds={{
                            header: 'admin.notifications.table.empty.header',
                            message: failed
                                ? 'admin.notifications.table.error.message'
                                : 'admin.notifications.table.empty.message',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={loading}
                        rows={
                            hasData ? (
                                <Rows
                                    columns={columns}
                                    data={data.alerts}
                                    disableDetailsLink={disableDetailsLink}
                                />
                            ) : null
                        }
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default AlertHistoryTable;
