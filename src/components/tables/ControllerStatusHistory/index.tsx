import { Box, Table, TableContainer } from '@mui/material';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useEntityStatusStore_recentHistory } from 'src/stores/EntityStatus/hooks';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import { SortDirection, TableColumns, TableState, TableStatuses } from 'src/types';
import { PublicationInfo } from 'src/types/controlPlane';
import Rows from './Rows';

export const columns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: 'data.event',
    },
    {
        field: 'created',
        headerIntlKey: 'data.created_at',
    },
    {
        field: 'completed',
        headerIntlKey: 'data.completed',
    },
    {
        field: 'errors',
        headerIntlKey: 'data.errors',
    },
];

export default function ControllerStatusHistoryTable() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const history: PublicationInfo[] | null | undefined =
        useEntityStatusStore_recentHistory(catalogName);

    const dataFetching = useEntityStatusStore(
        (state) => !state.hydrated || state.active
    );

    const errorExists = useEntityStatusStore((state) =>
        Boolean(state.hydrationErrorsExist || state.serverError)
    );

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState('created');

    const handlers = {
        sortRequest: (_event: React.MouseEvent<unknown>, column: any) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            setSortDirection(isAsc ? 'desc' : 'asc');
            setColumnToSort(column);
        },
        sort: (column: any) => (event: React.MouseEvent<unknown>) => {
            handlers.sortRequest(event, column);
        },
    };

    useEffect(() => {
        if (!history || dataFetching) {
            setTableState({ status: TableStatuses.LOADING });
        } else if (history.length > 0) {
            setTableState({
                status: TableStatuses.DATA_FETCHED,
            });
        } else {
            setTableState({
                status: TableStatuses.NO_EXISTING_DATA,
            });
        }
    }, [dataFetching, history, setTableState]);

    const loading = tableState.status === TableStatuses.LOADING;

    return (
        <TableContainer component={Box}>
            <Table
                size="small"
                sx={{ minWidth: 350, borderCollapse: 'separate' }}
                aria-label={intl.formatMessage({
                    id: 'details.ops.status.table.label',
                })}
            >
                <EntityTableHeader
                    columns={columns}
                    columnToSort={columnToSort}
                    sortDirection={sortDirection}
                    headerClick={handlers.sort}
                    selectData={true}
                />

                <EntityTableBody
                    columns={columns}
                    noExistingDataContentIds={{
                        header: 'details.ops.status.table.empty.header',
                        message: errorExists
                            ? 'details.ops.status.table.error.message'
                            : 'details.ops.status.table.empty.message',
                        disableDoclink: true,
                    }}
                    tableState={tableState}
                    loading={loading}
                    rows={
                        !errorExists &&
                        !loading &&
                        history &&
                        history.length > 0 ? (
                            <Rows
                                columnToSort={columnToSort}
                                data={history}
                                sortDirection={sortDirection}
                            />
                        ) : null
                    }
                />
            </Table>
        </TableContainer>
    );
}
