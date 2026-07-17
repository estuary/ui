import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { useCallback, useMemo } from 'react';

import { useClient, useQuery } from 'urql';

import { graphql } from 'src/gql-types';
import { useTenantStore } from 'src/stores/Tenant';

// Public types
export interface FragmentStore {
    provider: CloudProvider;
    region?: string | null;
    bucket?: string | null;
    storagePrefix?: string | null;

    // Azure-specific
    containerName?: string | null;
    storageAccountName?: string | null;
    accountTenantId?: string | null;
}

interface StorageMapping {
    catalogPrefix: string;
    spec: {
        dataPlanes: string[];
        fragmentStores: FragmentStore[];
    };
}

interface StorageMappingInput {
    catalogPrefix: string;
    spec: {
        fragmentStores: FragmentStore[];
        dataPlanes: string[];
    };
    detail?: string;
}

interface TestConnectionHealthResult {
    fragmentStore: FragmentStore;
    dataPlaneName: string;
    error: string | null;
}

// Internal types
type StorageProvider = 'GCS' | 'S3' | 'AZURE' | 'CUSTOM';

interface ServerFragmentStore {
    provider: StorageProvider;
    bucket?: string | null;
    region?: string | null;
    prefix?: string | null;

    // Azure-specific
    container_name?: string | null;
    storage_account_name?: string | null;
    account_tenant_id?: string | null;
}

// Shape of the storage mapping `spec` field, which the schema types as JSON
interface StorageMappingSpec {
    stores: ServerFragmentStore[];
    data_planes: string[];
}

interface StorageMappingVariables {
    catalogPrefix: string;
    spec: StorageMappingSpec;
    detail?: string;
}

// GraphQL Mutations
const CREATE_STORAGE_MAPPING = graphql(`
    mutation CreateStorageMapping(
        $catalogPrefix: Prefix!
        $spec: JSON!
        $detail: String
    ) {
        createStorageMapping(
            catalogPrefix: $catalogPrefix
            spec: $spec
            detail: $detail
        ) {
            catalogPrefix
        }
    }
`);

const UPDATE_STORAGE_MAPPING = graphql(`
    mutation UpdateStorageMapping(
        $catalogPrefix: Prefix!
        $spec: JSON!
        $detail: String
    ) {
        updateStorageMapping(
            catalogPrefix: $catalogPrefix
            spec: $spec
            detail: $detail
        ) {
            catalogPrefix
            republish
        }
    }
`);

const TEST_CONNECTION_HEALTH = graphql(`
    mutation TestConnectionHealth($catalogPrefix: Prefix!, $spec: JSON!) {
        testConnectionHealth(catalogPrefix: $catalogPrefix, spec: $spec) {
            results {
                fragmentStore
                dataPlaneName
                error
            }
        }
    }
`);

const QUERY = graphql(`
    query StorageMappingQuery($underPrefix: Prefix!) {
        storageMappings(by: { underPrefix: $underPrefix }) {
            edges {
                cursor
                node {
                    catalogPrefix
                    spec
                }
            }
        }
    }
`);

// Number of storage mappings fetched per page in the settings table.
const STORAGE_MAPPINGS_PAGE_SIZE = 10;

const TABLE_QUERY = graphql(`
    query StorageMappingsTable(
        $underPrefix: Prefix!
        $first: Int
        $after: String
    ) {
        storageMappings(
            by: { underPrefix: $underPrefix }
            first: $first
            after: $after
        ) {
            edges {
                cursor
                node {
                    catalogPrefix
                    spec
                }
            }
            pageInfo {
                ...PageInfoFields
            }
        }
    }
`);

// Row shape consumed by the settings table. `spec` is the raw server-side
// storage definition (stores + data plane assignments), matching what the
// table renders directly without the client-side FragmentStore mapping.
export interface StorageMappingTableRow {
    catalogPrefix: string;
    spec: StorageMappingSpec;
}

// Maps cloud provider names to storage provider variants (for GraphQL mutations)
const CLOUD_TO_STORAGE_PROVIDER: Record<CloudProvider, StorageProvider> = {
    GCP: 'GCS',
    AWS: 'S3',
    AZURE: 'AZURE',
};

// Maps storage provider variants (from server) back to cloud provider names
const STORAGE_TO_CLOUD_PROVIDER: Omit<
    Record<StorageProvider, CloudProvider>,
    'CUSTOM'
> = {
    GCS: 'GCP',
    S3: 'AWS',
    AZURE: 'AZURE',
};

function cloudProviderToStorageProvider(
    cloudProvider: CloudProvider
): StorageProvider {
    return CLOUD_TO_STORAGE_PROVIDER[cloudProvider];
}

function storageProviderToCloudProvider(
    storageProvider: StorageProvider
): CloudProvider {
    return STORAGE_TO_CLOUD_PROVIDER[
        storageProvider as keyof typeof STORAGE_TO_CLOUD_PROVIDER
    ];
}

function toServerStore(store: FragmentStore): ServerFragmentStore {
    return {
        provider: cloudProviderToStorageProvider(store.provider),
        bucket: store.bucket,
        region: store.region,
        prefix: store.storagePrefix,
        container_name: store.containerName,
        storage_account_name: store.storageAccountName,
        account_tenant_id: store.accountTenantId,
    };
}

function fromServerStore(store: ServerFragmentStore): FragmentStore {
    return {
        provider: storageProviderToCloudProvider(
            store.provider as keyof typeof STORAGE_TO_CLOUD_PROVIDER
        ),
        bucket: store.bucket,
        region: store.region,
        storagePrefix: store.prefix,
        containerName: store.container_name,
        storageAccountName: store.storage_account_name,
        accountTenantId: store.account_tenant_id,
    };
}

export function useStorageMappingService() {
    const client = useClient();
    const tenant = useTenantStore((state) => state.selectedTenant);

    const refetchMappings = useCallback(() => {
        if (tenant) {
            client
                .query(
                    QUERY,
                    { underPrefix: tenant },
                    { requestPolicy: 'network-only' }
                )
                .toPromise();
        }
    }, [client, tenant]);

    const testConnection = useCallback(
        async (
            catalogPrefix: string,
            dataPlanes: DataPlaneNode[],
            stores: FragmentStore[]
        ): Promise<TestConnectionHealthResult[]> => {
            const result = await client.mutation(TEST_CONNECTION_HEALTH, {
                catalogPrefix,
                spec: {
                    stores: stores.map(toServerStore),
                    data_planes: dataPlanes.map((dp) => dp.name),
                },
            } satisfies StorageMappingVariables);

            if (result.error) {
                throw new Error(
                    result.error.graphQLErrors?.[0]?.message ??
                        result.error.message ??
                        'Failed to test connection health'
                );
            }

            return (
                result.data?.testConnectionHealth?.results.map((r) => ({
                    fragmentStore: fromServerStore(r.fragmentStore),
                    dataPlaneName: r.dataPlaneName,
                    error: r.error ?? null,
                })) ?? []
            );
        },
        [client]
    );

    const create = useCallback(
        async (input: StorageMappingInput) => {
            const result = await client.mutation(CREATE_STORAGE_MAPPING, {
                catalogPrefix: input.catalogPrefix,
                detail: input.detail,
                spec: {
                    stores: input.spec.fragmentStores.map(toServerStore),
                    data_planes: input.spec.dataPlanes,
                },
            } satisfies StorageMappingVariables);

            if (result.error) {
                throw new Error(
                    result.error.graphQLErrors?.[0]?.message ??
                        result.error.message ??
                        'Failed to create storage mapping'
                );
            }

            if (!result.data?.createStorageMapping) {
                throw new Error(
                    'No response from createStorageMapping mutation'
                );
            }

            refetchMappings();
            return result.data.createStorageMapping;
        },
        [client, refetchMappings]
    );

    const update = useCallback(
        async (input: StorageMappingInput) => {
            const result = await client.mutation(UPDATE_STORAGE_MAPPING, {
                catalogPrefix: input.catalogPrefix,
                detail: input.detail,
                spec: {
                    stores: input.spec.fragmentStores.map(toServerStore),
                    data_planes: input.spec.dataPlanes,
                },
            } satisfies StorageMappingVariables);

            if (result.error) {
                throw new Error(
                    result.error.graphQLErrors?.[0]?.message ??
                        result.error.message ??
                        'Failed to update storage mapping'
                );
            }

            if (!result.data?.updateStorageMapping) {
                throw new Error(
                    'No response from updateStorageMapping mutation'
                );
            }

            refetchMappings();
            return result.data.updateStorageMapping;
        },
        [client, refetchMappings]
    );

    return {
        testConnection,
        create,
        update,
    };
}

export function useStorageMappings() {
    const tenant = useTenantStore((state) => state.selectedTenant);

    const [{ data, fetching, error }] = useQuery({
        query: QUERY,
        variables: { underPrefix: tenant },
        pause: !tenant,
    });

    const storageMappings: StorageMapping[] =
        data?.storageMappings.edges.map((edge) => {
            const spec = edge.node.spec as StorageMappingSpec;

            return {
                catalogPrefix: edge.node.catalogPrefix,
                spec: {
                    fragmentStores: spec.stores.map(fromServerStore),
                    dataPlanes: spec.data_planes ?? [],
                },
            };
        }) ?? [];

    return {
        storageMappings,
        loading: fetching,
        error,
    };
}

const EMPTY_ROWS: StorageMappingTableRow[] = [];

// Cursor-paginated storage mappings for the admin settings table. Forward
// pagination only; pair with useCursorPagination for backwards navigation.
export function usePaginatedStorageMappings(afterCursor?: string) {
    const tenant = useTenantStore((state) => state.selectedTenant);

    const [{ fetching, data, error }] = useQuery({
        query: TABLE_QUERY,
        variables: {
            underPrefix: tenant,
            first: STORAGE_MAPPINGS_PAGE_SIZE,
            after: afterCursor,
        },
        pause: !tenant,
    });

    const storageMappings = useMemo<StorageMappingTableRow[]>(
        () =>
            data?.storageMappings.edges.map((edge) => ({
                catalogPrefix: edge.node.catalogPrefix,
                spec: edge.node.spec as StorageMappingSpec,
            })) ?? EMPTY_ROWS,
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
