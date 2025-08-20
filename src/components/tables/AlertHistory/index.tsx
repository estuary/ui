import type { AlertHistoryTableProps } from 'src/components/tables/AlertHistory/types';
import type { TableState } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Table, TableContainer } from '@mui/material';

import { useIntl } from 'react-intl';
import { useQuery } from 'urql';

import Rows from 'src/components/tables/AlertHistory/Rows';
import {
    optionalColumns,
    tableColumns,
} from 'src/components/tables/AlertHistory/shared';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { useDisplayTableColumns } from 'src/context/TableSettings';
import { TableStatuses } from 'src/types';
import { evaluateColumnsToShow } from 'src/utils/table-utils';

function AlertHistoryTable({
    getDataFromResponse,
    querySettings,
    tablePrefix,
}: AlertHistoryTableProps) {
    const intl = useIntl();

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

    console.log('columnsToShow', columnsToShow);

    // Get the data from the server
    const [{ fetching, data: fooData, error }] = useQuery(querySettings);

    const data = useMemo(() => {
        if (getDataFromResponse) {
            return getDataFromResponse(fooData);
        }

        return fooData;
    }, [fooData, getDataFromResponse]);

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
        if (data?.alerts && data.alerts.length > 0) {
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
                        hasData && data?.alerts ? (
                            <Rows columns={columnsToShow} data={data?.alerts} />
                        ) : null
                    }
                />
            </Table>
        </TableContainer>
    );
}

export default AlertHistoryTable;
