import type { StorageMappingsTableQuery } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { useQuery } from 'urql';

import { graphql } from 'src/gql-types';
import { stripCollectionDataSuffix } from 'src/hooks/storageMappings/utils';

// Number of storage mappings fetched per page in the settings table.
const STORAGE_MAPPINGS_PAGE_SIZE = 10;

type StorageMappingsTableRow =
    StorageMappingsTableQuery['storageMappings']['edges'][number]['node'];

const QUERY = graphql(`
    query StorageMappingsTable($prefix: String!, $first: Int, $after: String) {
        storageMappings(
            filter: { catalogPrefix: { startsWith: $prefix } }
            first: $first
            after: $after
        ) {
            edges {
                cursor
                node {
                    catalogPrefix
                    dataPlanes {
                        name
                    }
                    fragmentStores {
                        provider
                        prefix
                        bucket
                    }
                }
            }
            pageInfo {
                ...PageInfoFields
            }
        }
    }
`);

// Cursor-paginated storage mappings for the admin settings table. Forward
// pagination only; pair with useCursorPagination for backwards navigation.
export function useStorageMappingsTableQuery(
    prefix: string,
    afterCursor?: string
) {
    const [{ fetching, data, error }] = useQuery({
        query: QUERY,
        variables: {
            prefix,
            first: STORAGE_MAPPINGS_PAGE_SIZE,
            after: afterCursor,
        },
        pause: !prefix,
    });

    const storageMappings = useMemo<StorageMappingsTableRow[]>(
        () =>
            data?.storageMappings.edges.map((edge) =>
                transformRow(edge.node)
            ) ?? [],
        [data]
    );

    const pageInfo = data?.storageMappings.pageInfo ?? null;

    return {
        storageMappings,
        fetching,
        error,
        pageInfo,
        pageSize: STORAGE_MAPPINGS_PAGE_SIZE,
    };
}

function transformRow(row: StorageMappingsTableRow): StorageMappingsTableRow {
    const fragmentStores = row.fragmentStores.map((store) => {
        const prefix = stripCollectionDataSuffix(store.prefix);
        return { ...store, prefix };
    });

    return { ...row, fragmentStores };
}
