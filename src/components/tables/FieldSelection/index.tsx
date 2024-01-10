import { Box, Table, TableContainer } from '@mui/material';
import { CompositeProjection } from 'components/editor/Bindings/FieldSelection/types';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import Rows from 'components/tables/FieldSelection/Rows';
import { useDisplayTableColumns } from 'context/TableSettings';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { SortDirection, TableColumns, TableState, TableStatuses } from 'types';

interface Props {
    projections: CompositeProjection[] | null | undefined;
}

export const optionalColumnIntlKeys = {
    pointer: 'data.pointer',
    details: 'fieldSelection.table.label.details',
};

export const columns: TableColumns[] = [
    {
        field: 'field',
        headerIntlKey: 'data.field',
        sticky: true,
    },
    {
        field: 'ptr',
        headerIntlKey: optionalColumnIntlKeys.pointer,
    },
    {
        field: null,
        headerIntlKey: 'data.type',
    },
    {
        field: 'constraint.type',
        headerIntlKey: optionalColumnIntlKeys.details,
    },
    {
        field: null,
        headerIntlKey: 'fieldSelection.table.label.actions',
    },
];

function FieldSelectionTable({ projections }: Props) {
    const intl = useIntl();

    const formStatus = useFormStateStore_status();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] = useState('field');

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
        if (
            formStatus === FormStatus.INIT ||
            formStatus === FormStatus.FAILED
        ) {
            setTableState({
                status: TableStatuses.NO_EXISTING_DATA,
            });
        } else if (
            formStatus === FormStatus.GENERATING ||
            formStatus === FormStatus.TESTING ||
            formStatus === FormStatus.TESTING_BACKGROUND
        ) {
            setTableState({ status: TableStatuses.LOADING });
        } else {
            setTableState({
                status:
                    projections && projections.length > 0
                        ? TableStatuses.DATA_FETCHED
                        : TableStatuses.NO_EXISTING_DATA,
            });
        }
    }, [formStatus, projections]);

    const failed = formStatus === FormStatus.FAILED;
    const loading = tableState.status === TableStatuses.LOADING;

    const { tableSettings } = useDisplayTableColumns();

    const columnsToShow = useMemo(
        () =>
            tableSettings && Object.hasOwn(tableSettings, 'fieldSelection')
                ? columns.filter((column) =>
                      column.headerIntlKey
                          ? !tableSettings.fieldSelection.hiddenColumns.includes(
                                intl.formatMessage({ id: column.headerIntlKey })
                            )
                          : true
                  )
                : columns,
        [tableSettings]
    );

    return (
        <Box>
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350, borderCollapse: 'separate' }}
                    aria-label={intl.formatMessage({
                        id: 'entityTable.title',
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
                            header: 'fieldSelection.table.empty.header',
                            message: failed
                                ? 'fieldSelection.table.error.message'
                                : 'fieldSelection.table.empty.message',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={loading}
                        rows={
                            !failed &&
                            !loading &&
                            projections &&
                            projections.length > 0 &&
                            formStatus !== FormStatus.TESTING ? (
                                <Rows
                                    columns={columnsToShow}
                                    data={projections}
                                    sortDirection={sortDirection}
                                    columnToSort={columnToSort}
                                />
                            ) : null
                        }
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default FieldSelectionTable;
