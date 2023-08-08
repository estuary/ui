import { getLiveSpecs_collectionsSelector } from 'api/liveSpecsExt';
import EntityTable from 'components/tables/EntityTable';
import RowSelector from 'components/tables/RowActions/RowSelector';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import Rows from './Rows';

const selectableTableStoreName = SelectTableStoreNames.COLLECTION_SELECTOR;
export const tableColumns = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.userFullName',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
];

function Hydrator() {
    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('csl', 'catalog_name', 'desc');

    const query = useMemo(() => {
        return getLiveSpecs_collectionsSelector(pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

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
                setPagination={setPagination}
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
                keepSelectionOnAction
                toolbar={
                    <RowSelector
                        hideActions
                        selectableTableStoreName={selectableTableStoreName}
                    />
                }
            />
        </TableHydrator>
    );
}

export default Hydrator;
