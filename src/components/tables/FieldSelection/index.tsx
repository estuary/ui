import { Box, Stack, Table, TableContainer } from '@mui/material';
import FieldActions from 'components/editor/Bindings/FieldSelection/FieldActions';
import TableColumnSelector from 'components/editor/Bindings/FieldSelection/TableColumnSelector';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import Rows from 'components/tables/FieldSelection/Rows';
import { useDisplayTableColumns } from 'context/TableSettings';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useBinding_searchQuery } from 'stores/Binding/hooks';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { TablePrefixes } from 'stores/Tables/hooks';
import { SortDirection, TableState, TableStatuses } from 'types';
import FieldFilter from './FieldFilter';
import {
    evaluateColumnsToShow,
    optionalColumnIntlKeys,
    tableColumns,
} from './shared';
import { FieldSelectionTableProps } from './types';

export default function FieldSelectionTable({
    bindingUUID,
    projections,
}: FieldSelectionTableProps) {
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

    const searchQuery = useBinding_searchQuery();

    const processedProjections = useMemo(
        () =>
            searchQuery
                ? projections?.filter(
                      ({ field, ptr }) =>
                          field.includes(searchQuery) ||
                          ptr?.includes(searchQuery)
                  )
                : projections,
        [projections, searchQuery]
    );

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
        } else if (processedProjections && processedProjections.length > 0) {
            setTableState({
                status: TableStatuses.DATA_FETCHED,
            });
        } else {
            setTableState({
                status: searchQuery
                    ? TableStatuses.UNMATCHED_FILTER
                    : TableStatuses.NO_EXISTING_DATA,
            });
        }
    }, [formStatus, processedProjections, searchQuery]);

    const failed = formStatus === FormStatus.FAILED;
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
        <>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    mb: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <FieldActions
                    bindingUUID={bindingUUID}
                    loading={loading}
                    projections={processedProjections}
                />

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <FieldFilter disabled={loading} />

                    <TableColumnSelector
                        columns={tableColumns}
                        loading={loading}
                    />
                </Stack>
            </Stack>

            <Box>
                <TableContainer component={Box}>
                    <Table
                        size="small"
                        sx={{ minWidth: 350, borderCollapse: 'separate' }}
                        aria-label={intl.formatMessage({
                            id: 'fieldSelection.table.label',
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
                                processedProjections &&
                                processedProjections.length > 0 &&
                                formStatus !== FormStatus.TESTING ? (
                                    <Rows
                                        columns={columnsToShow}
                                        data={processedProjections}
                                        sortDirection={sortDirection}
                                        columnToSort={columnToSort}
                                    />
                                ) : null
                            }
                        />
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
}
