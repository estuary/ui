import { Box, Table, TableContainer } from '@mui/material';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { useDisplayTableColumns } from 'context/TableSettings';
import { PublicationInfo } from 'deps/control-plane/types';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useEntityStatusStore_recentHistory } from 'stores/EntityStatus/hooks';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { TablePrefixes } from 'stores/Tables/hooks';
import { SortDirection, TableColumns, TableState, TableStatuses } from 'types';
import Rows from './Rows';

export const optionalColumnIntlKeys = {
    pointer: 'data.pointer',
    details: 'data.details',
};

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

const evaluateColumnsToShow = (columnsToHide: string[]) =>
    columns.filter((column) =>
        column.headerIntlKey
            ? !columnsToHide.includes(column.headerIntlKey)
            : true
    );

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

    const { tableSettings } = useDisplayTableColumns();

    const columnsToShow = useMemo(() => {
        const optionalColumns = Object.values(optionalColumnIntlKeys);

        if (
            tableSettings &&
            Object.hasOwn(tableSettings, TablePrefixes.fieldSelection)
        ) {
            const hiddenColumns = optionalColumns.filter(
                (column) =>
                    !tableSettings[
                        TablePrefixes.fieldSelection
                    ].shownOptionalColumns.includes(column)
            );

            return evaluateColumnsToShow(hiddenColumns);
        }

        return evaluateColumnsToShow(optionalColumns);
    }, [tableSettings]);

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
                    columns={columnsToShow}
                    columnToSort={columnToSort}
                    sortDirection={sortDirection}
                    headerClick={handlers.sort}
                    selectData={true}
                />

                <EntityTableBody
                    columns={columnsToShow}
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
