import { useEffect, useMemo } from 'react';

import { useStore } from 'zustand';

import { useUnmount } from 'react-use';

import { getLiveSpecs_entitySelector } from 'src/api/liveSpecsExt';
import type { TableHydratorProps } from 'src/components/shared/Entity/types';
import EntityTable from 'src/components/tables/EntityTable';
import RowSelector from 'src/components/tables/RowActions/RowSelector';
import invariableStores from 'src/context/Zustand/invariableStores';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { SelectTableStoreNames } from 'src/stores/names';
import { useTableState } from 'src/stores/Tables/hooks';
import TableHydrator from 'src/stores/Tables/Hydrator';
import { MAX_BINDINGS } from 'src/utils/workflow-utils';
import Rows from 'src/components/collection/Selector/Table/Rows';
import { useCollectionsSelectorColumns } from 'src/components/collection/Selector/Table/useCollectionsSelectorColumns';
import { EVERYTHING, publishedColumn } from 'src/components/collection/Selector/Table/shared';

const selectableTableStoreName = SelectTableStoreNames.ENTITY_SELECTOR;
const tableRowsPerPage = [10, 50, 100, MAX_BINDINGS];

function Hydrator({
    disableQueryParamHack,
    entity = 'collection',
    selectedCollections,
}: TableHydratorProps) {
    const tableColumns = useCollectionsSelectorColumns(
        ENTITY_SETTINGS[entity].selector.optionalColumns
    );

    const {
        reset,
        pagination,
        setPagination,
        rowsPerPage,
        setRowsPerPage,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('esl', publishedColumn, 'desc', tableRowsPerPage[0]);

    const query = useMemo(() => {
        return getLiveSpecs_entitySelector(pagination, entity, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, entity, pagination, searchQuery, sortDirection]);

    const setDisabledRows = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return state.setDisabledRows;
        }
    );

    useEffect(() => {
        setDisabledRows(selectedCollections);
    }, [selectedCollections, setDisabledRows]);

    useUnmount(() => {
        reset();
    });

    return (
        <TableHydrator
            disableQueryParamHack={disableQueryParamHack}
            query={query}
            selectableTableStoreName={selectableTableStoreName}
            disableMultiSelect={
                ENTITY_SETTINGS[entity].selector.disableMultiSelect
            }
        >
            <EntityTable
                noExistingDataContentIds={
                    ENTITY_SETTINGS[entity].selector.noExistingDataContentIds
                }
                columns={tableColumns}
                renderTableRows={(data) => <Rows data={data} />}
                pagination={pagination}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={tableRowsPerPage}
                setPagination={setPagination}
                setRowsPerPage={setRowsPerPage}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header={ENTITY_SETTINGS[entity].selector.headerIntlKey}
                filterLabel={ENTITY_SETTINGS[entity].selector.filterIntlKey}
                selectableTableStoreName={selectableTableStoreName}
                showToolbar
                toolbar={
                    <RowSelector
                        hideActions
                        showSelectedCount
                        selectKeyValueName={EVERYTHING}
                        selectableTableStoreName={selectableTableStoreName}
                    />
                }
            />
        </TableHydrator>
    );
}

export default Hydrator;
