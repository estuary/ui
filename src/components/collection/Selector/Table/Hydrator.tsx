import { getLiveSpecs_collectionsSelector } from 'api/liveSpecsExt';
import EntityTable from 'components/tables/EntityTable';
import RowSelector from 'components/tables/RowActions/RowSelector';
import invariableStores from 'context/Zustand/invariableStores';
import { useEffect, useMemo } from 'react';
import { useUnmount } from 'react-use';
import { SelectTableStoreNames } from 'stores/names';
import { useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import { useStore } from 'zustand';
import Rows from './Rows';

const selectableTableStoreName = SelectTableStoreNames.COLLECTION_SELECTOR;
const tableRowsPerPage = [10, 50, 100, 300];
const catalogNameColumn = 'catalog_name';
export const tableColumns = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: catalogNameColumn,
        headerIntlKey: 'entityTable.data.userFullName',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
];

interface Props {
    selectedCollections: string[];
}

function Hydrator({ selectedCollections }: Props) {
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
    } = useTableState('csl', catalogNameColumn, 'desc', tableRowsPerPage[0]);

    const query = useMemo(() => {
        return getLiveSpecs_collectionsSelector(pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    //
    const setDisabledRows = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.setDisabledRows;
        }
    );
    useEffect(() => {
        console.log('updating the rows that are disabled');
        setDisabledRows(selectedCollections);
    }, [selectedCollections, setDisabledRows]);

    useUnmount(() => {
        reset();
    });

    return (
        <TableHydrator
            query={query}
            selectableTableStoreName={selectableTableStoreName}
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
                        selectKeyValueName={catalogNameColumn}
                        selectableTableStoreName={selectableTableStoreName}
                    />
                }
            />
        </TableHydrator>
    );
}

export default Hydrator;
