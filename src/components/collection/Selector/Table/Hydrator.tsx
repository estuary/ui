import { getLiveSpecs_entitySelector } from 'api/liveSpecsExt';
import { TableHydratorProps } from 'components/shared/Entity/types';
import EntityTable from 'components/tables/EntityTable';
import RowSelector from 'components/tables/RowActions/RowSelector';
import invariableStores from 'context/Zustand/invariableStores';
import { useEffect, useMemo } from 'react';
import { useUnmount } from 'react-use';
import { SelectTableStoreNames } from 'stores/names';
import { useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import { MAX_BINDINGS } from 'utils/workflow-utils';
import { useStore } from 'zustand';
import Rows from './Rows';
import { EVERYTHING, publishedColumn } from './shared';
import useCollectionsSelectorColumns from './useCollectionsSelectorColumns';

const selectableTableStoreName = SelectTableStoreNames.ENTITY_SELECTOR;
const tableRowsPerPage = [10, 50, 100, MAX_BINDINGS];

function Hydrator({
    disableQueryParamHack,
    entity,
    selectedCollections,
}: TableHydratorProps) {
    const selectingCaptures = entity === 'capture';
    const selectingMaterializations = entity === 'materialization';

    const tableColumns = useCollectionsSelectorColumns(
        selectingMaterializations
            ? 'readsFrom'
            : selectingCaptures
            ? 'writesTo'
            : undefined
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
        return getLiveSpecs_entitySelector(
            pagination,
            entity ?? 'collection',
            searchQuery,
            [
                {
                    col: columnToSort,
                    direction: sortDirection,
                },
            ]
        );
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
            disableMultiSelect={selectingCaptures || selectingMaterializations}
        >
            <EntityTable
                noExistingDataContentIds={{
                    header: 'collections.message1',
                    message: 'collections.message2',
                }}
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
                header={null}
                filterLabel="collectionsTable.filterLabel"
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
