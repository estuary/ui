import type {
    ExpandedFieldSelection,
    FieldSelectionTableProps,
} from 'src/components/tables/FieldSelection/types';
import type { SortDirection, TableState } from 'src/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Stack, Table, TableContainer, Tooltip } from '@mui/material';

import { debounce } from 'lodash';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import AlgorithmMenu from 'src/components/fieldSelection/FieldActions/AlgorithmMenu';
import ExcludeAllButton from 'src/components/fieldSelection/FieldActions/ExcludeAllButton';
import GroupByKeys from 'src/components/fieldSelection/FieldActions/GroupByKeys';
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
import {
    useBinding_resourceConfigOfMetaBindingProperty,
    useBinding_searchQuery,
} from 'src/stores/Binding/hooks';
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

    const selections: ExpandedFieldSelection[] = useBindingStore((state) =>
        state.selections?.[bindingUUID]
            ? Object.values(state.selections[bindingUUID].value).map(
                  (selection) => ({
                      ...selection,
                      isGroupByKey:
                          state.selections[bindingUUID].groupBy.explicit
                              .length > 0
                              ? state.selections[
                                    bindingUUID
                                ].groupBy.explicit.includes(selection.field)
                              : state.selections[
                                    bindingUUID
                                ].groupBy.implicit.includes(selection.field),
                  })
              )
            : []
    );
    const selectionsHydrating = useBindingStore(
        (state) => state.selections?.[bindingUUID]?.hydrating
    );
    const selectionsRefreshing = useBindingStore(
        (state) => state.selections?.[bindingUUID]?.status === 'RESET_REQUESTED'
    );
    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );
    const setRecommendFields = useBindingStore(
        (state) => state.setRecommendFields
    );
    const builtBindingIndex = useBinding_resourceConfigOfMetaBindingProperty(
        bindingUUID,
        'builtBindingIndex'
    );
    const validatedBindingIndex =
        useBinding_resourceConfigOfMetaBindingProperty(
            bindingUUID,
            'validatedBindingIndex'
        );

    const persistedDraftId = useEditorStore_persistedDraftId();

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

    const displayLoadingState = useRef(
        debounce(() => setTableState({ status: TableStatuses.LOADING }), 750)
    );

    useUnmount(() => {
        displayLoadingState.current?.cancel();
    });

    useEffect(() => {
        if (selectionsHydrating) {
            // Ensure that the loading state is displayed immediately
            // when a field selection refresh is initiated.
            selectionsRefreshing
                ? setTableState({ status: TableStatuses.LOADING })
                : displayLoadingState.current();
        } else if (processedSelections.length > 0) {
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
        displayLoadingState,
        processedSelections.length,
        searchQuery,
        selectionsHydrating,
        selectionsRefreshing,
    ]);

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

    const draftSpecAssetsMissing =
        typeof builtBindingIndex !== 'number' ||
        builtBindingIndex < 0 ||
        typeof validatedBindingIndex !== 'number' ||
        validatedBindingIndex < 0;

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
                <Stack
                    direction="row"
                    spacing={1}
                    style={{ alignItems: 'center', paddingRight: 16 }}
                >
                    <Tooltip
                        placement="top-start"
                        title={
                            draftSpecAssetsMissing
                                ? intl.formatMessage({
                                      id: 'fieldSelection.table.empty.message',
                                  })
                                : ''
                        }
                    >
                        <span>
                            <AlgorithmMenu
                                handleClick={(recommended) => {
                                    setRecommendFields(
                                        bindingUUID,
                                        recommended
                                    );
                                    advanceHydrationStatus(
                                        'HYDRATED',
                                        bindingUUID
                                    );
                                }}
                                disabled={loading || draftSpecAssetsMissing}
                            />
                        </span>
                    </Tooltip>

                    <GroupByKeys
                        bindingUUID={bindingUUID}
                        loading={loading}
                        selections={selections}
                    />
                </Stack>

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
                                message:
                                    formStatus === FormStatus.FAILED
                                        ? 'fieldSelection.table.error.message'
                                        : !persistedDraftId
                                          ? 'fieldSelection.table.noDraft.message'
                                          : 'fieldSelection.table.empty.message',
                                disableDoclink: true,
                            }}
                            tableState={tableState}
                            loading={loading}
                            rows={
                                !missingServerData &&
                                !loading &&
                                processedSelections &&
                                processedSelections.length > 0 ? (
                                    <Rows
                                        columnToSort={columnToSort}
                                        columns={columnsToShow}
                                        data={processedSelections}
                                        sortDirection={sortDirection}
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
