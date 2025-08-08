import type { FieldSelectionTableProps } from 'src/components/tables/FieldSelection/types';
import type { SortDirection, TableState } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Stack, Table, TableContainer } from '@mui/material';

import { useIntl } from 'react-intl';

import AlgorithmMenu from 'src/components/fieldSelection/FieldActions/AlgorithmMenu';
import ExcludeAllButton from 'src/components/fieldSelection/FieldActions/ExcludeAllButton';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import FieldFilter from 'src/components/tables/FieldSelection/FieldFilter';
import Rows from 'src/components/tables/FieldSelection/Rows';
import {
    optionalColumns,
    tableColumns,
} from 'src/components/tables/FieldSelection/shared';
import TableColumnSelector from 'src/components/tables/TableColumnSelector';
import { useDisplayTableColumns } from 'src/context/TableSettings';
import { useBinding_searchQuery } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { TablePrefixes } from 'src/stores/Tables/hooks';
import { TableStatuses } from 'src/types';
import { evaluateColumnsToShow } from 'src/utils/table-utils';

export default function FieldSelectionTable({
    bindingUUID,
    missingServerData,
}: FieldSelectionTableProps) {
    const intl = useIntl();

    const selections = useBindingStore((state) =>
        state.selections?.[bindingUUID]
            ? Object.entries(state.selections[bindingUUID].value).map(
                  ([field, selection]) => ({ ...selection, field })
              )
            : []
    );
    const selectionsHydrating = useBindingStore(
        (state) => state.selections?.[bindingUUID]?.hydrating
    );

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

    const processedSelections = useMemo(
        () =>
            searchQuery
                ? selections?.filter(
                      ({ field, projection }) =>
                          field.includes(searchQuery) ||
                          projection?.ptr?.includes(searchQuery)
                  )
                : selections,
        [selections, searchQuery]
    );

    useEffect(() => {
        if (formStatus === FormStatus.INIT) {
            setTableState({
                status: TableStatuses.NO_EXISTING_DATA,
            });
        } else if (selectionsHydrating) {
            setTableState({ status: TableStatuses.LOADING });
        } else if (processedSelections && processedSelections.length > 0) {
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
    }, [formStatus, processedSelections, searchQuery, selectionsHydrating]);

    const loading = tableState.status === TableStatuses.LOADING;

    const { tableSettings } = useDisplayTableColumns();

    const columnsToShow = useMemo(
        () =>
            evaluateColumnsToShow(
                optionalColumns,
                tableColumns,
                TablePrefixes.fieldSelection,
                tableSettings
            ),
        [tableSettings]
    );

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
                <AlgorithmMenu
                    bindingUUID={bindingUUID}
                    loading={loading}
                    selections={selections}
                />

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <FieldFilter disabled={loading} />

                    <ExcludeAllButton
                        bindingUUID={bindingUUID}
                        loading={loading}
                        selections={processedSelections}
                    />

                    <TableColumnSelector
                        loading={loading}
                        optionalColumns={optionalColumns}
                        tablePrefix={TablePrefixes.fieldSelection}
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
                                message: missingServerData
                                    ? 'fieldSelection.table.error.message'
                                    : 'fieldSelection.table.empty.message',
                                disableDoclink: true,
                            }}
                            tableState={tableState}
                            loading={loading}
                            rows={
                                !missingServerData &&
                                !loading &&
                                processedSelections &&
                                processedSelections.length > 0 &&
                                formStatus !== FormStatus.TESTING ? (
                                    <Rows
                                        columns={columnsToShow}
                                        data={processedSelections}
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
