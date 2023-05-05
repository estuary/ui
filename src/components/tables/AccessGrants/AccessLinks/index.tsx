import { Box } from '@mui/material';
import { getDirectiveByCatalogPrefix } from 'api/directives';
import Rows from 'components/tables/AccessGrants/AccessLinks/Rows';
import EntityTable from 'components/tables/EntityTable';
import RowSelector from 'components/tables/RowActions/AccessLinks/RowSelector';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import useTableState from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import { TableColumns } from 'types';

interface Props {
    prefixes: string[];
}

export const columns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'provisioning_prefix',
        headerIntlKey:
            'accessGrants.table.accessLinks.label.provisioningPrefix',
    },
    {
        field: 'granted_prefix',
        headerIntlKey: 'accessGrants.table.accessLinks.label.grantedPrefix',
    },
    {
        field: 'capability',
        headerIntlKey: 'accessGrants.table.accessLinks.label.capability',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'accessGrants.table.accessLinks.label.lastUpdated',
    },
    {
        field: null,
        headerIntlKey: '',
    },
];

const selectableTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

function AccessLinksTable({ prefixes }: Props) {
    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('ali', 'updated_at', 'desc');

    const query = useMemo(() => {
        return getDirectiveByCatalogPrefix(
            'grant',
            prefixes,
            pagination,
            searchQuery,
            [
                {
                    col: columnToSort,
                    direction: sortDirection,
                },
            ]
        );
    }, [columnToSort, pagination, prefixes, searchQuery, sortDirection]);

    const headerKey = 'accessGrants.table.accessLinks.title';
    const filterKey = 'accessGrants.table.accessLinks.label.filter';

    return (
        <Box>
            <TableHydrator
                query={query}
                selectableTableStoreName={selectableTableStoreName}
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'accessGrants.message1',
                        message: 'accessGrants.message2',
                        disableDoclink: true,
                    }}
                    columns={columns}
                    renderTableRows={(data) => <Rows data={data} />}
                    pagination={pagination}
                    setPagination={setPagination}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    columnToSort={columnToSort}
                    setColumnToSort={setColumnToSort}
                    header={headerKey}
                    filterLabel={filterKey}
                    selectableTableStoreName={selectableTableStoreName}
                    enableSelection={true}
                    showToolbar={true}
                    toolbar={<RowSelector />}
                />
            </TableHydrator>
        </Box>
    );
}

export default AccessLinksTable;
