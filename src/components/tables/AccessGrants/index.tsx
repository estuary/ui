import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/AccessGrants/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';

// const queryColumns = ['id', 'spec_type', 'catalog_name', 'updated_at'];

function AccessGrantsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

    const rolesQuery = useQuery<any>(
        TABLES.COMBINED_GRANTS_EXT,
        {
            columns: `id, subject_role, object_role, capability, user_avatar_url, user_full_name, updated_at`,
            count: 'exact',
            filter: (query) => {
                return defaultTableFilter<any>(
                    query,
                    ['user_full_name', 'subject_role', 'object_role'],
                    searchQuery,
                    columnToSort,
                    sortDirection,
                    pagination
                );
            },
        },
        [pagination, searchQuery, columnToSort, sortDirection]
    );

    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'accessGrants.message1',
                    message: 'accessGrants.message2',
                    docLink: 'accessGrants.message2.docLink',
                    docPath: 'accessGrants.message2.docPath',
                }}
                columns={tableColumns}
                query={rolesQuery}
                renderTableRows={(data) => <Rows data={data} />}
                setPagination={setPagination}
                setSearchQuery={setSearchQuery}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header="accessGrantsTable.title"
                filterLabel="accessGrantsTable.filterLabel"
            />
        </Box>
    );
}

export default AccessGrantsTable;
