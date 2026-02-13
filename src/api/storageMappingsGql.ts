import type { Client } from 'urql';

import { useCallback } from 'react';

import { DataPlaneNode } from './dataPlanesGql';
import { gql, useClient, useQuery } from 'urql';

import { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import { useTenantStore } from 'src/stores/Tenant/Store';

// Storage provider values used by the GraphQL server
type StorageProvider = 'GCS' | 'S3' | 'AZURE' | 'CUSTOM';

// External type - used by consumers of this service
export interface FragmentStore {
    provider: CloudProvider;
    bucket: string;
    prefix?: string;
}

// Internal type - used for server communication
interface ServerFragmentStore {
    provider: StorageProvider;
    bucket: string;
    prefix?: string;
}

// GraphQL Types
interface CreateStorageMappingResult {
    created: boolean;
    catalogPrefix: string;
}

interface CreateStorageMappingResponse {
    createStorageMapping: CreateStorageMappingResult | null;
}

interface CreateStorageMappingVariables {
    catalogPrefix: string;
    storage: {
        stores: ServerFragmentStore[];
        data_planes: string[];
    };
    detail?: string;
}

interface UpdateStorageMappingResult {
    republish: boolean;
    catalogPrefix: string;
}

interface UpdateStorageMappingResponse {
    updateStorageMapping: UpdateStorageMappingResult | null;
}

// Public result type returned by the service
export interface TestConnectionHealthResult {
    fragmentStore: FragmentStore;
    dataPlaneName: string;
    error: string | null;
}

// Internal types for GraphQL communication
interface ServerTestConnectionHealthResult {
    fragmentStore: ServerFragmentStore;
    dataPlaneName: string;
    error: string | null;
}

interface TestConnectionHealthResponse {
    testConnectionHealth: {
        results: ServerTestConnectionHealthResult[];
    } | null;
}

interface TestConnectionHealthVariables {
    catalogPrefix: string;
    storage: {
        stores: ServerFragmentStore[];
        data_planes: string[];
    };
}

// Public input type for consumers of this service
export interface CreateStorageMappingInput {
    catalogPrefix: string;
    storage: {
        stores: FragmentStore[];
        data_planes: string[];
    };
    detail?: string;
}

// GraphQL Mutations
const CREATE_STORAGE_MAPPING = gql<
    CreateStorageMappingResponse,
    CreateStorageMappingVariables
>`
    mutation CreateStorageMapping(
        $catalogPrefix: Prefix!
        $storage: JSON!
        $detail: String
    ) {
        createStorageMapping(
            catalogPrefix: $catalogPrefix
            storage: $storage
            detail: $detail
        ) {
            catalogPrefix
        }
    }
`;

const UPDATE_STORAGE_MAPPING = gql<
    UpdateStorageMappingResponse,
    CreateStorageMappingVariables
>`
    mutation UpdateStorageMapping(
        $catalogPrefix: Prefix!
        $storage: JSON!
        $detail: String
    ) {
        updateStorageMapping(
            catalogPrefix: $catalogPrefix
            storage: $storage
            detail: $detail
        ) {
            catalogPrefix
            republish
        }
    }
`;

const TEST_CONNECTION_HEALTH = gql<
    TestConnectionHealthResponse,
    TestConnectionHealthVariables
>`
    mutation TestConnectionHealth($catalogPrefix: Prefix!, $storage: JSON!) {
        testConnectionHealth(catalogPrefix: $catalogPrefix, storage: $storage) {
            results {
                fragmentStore
                dataPlaneName
                error
            }
        }
    }
`;

interface StorageMappingsQueryResponse {
    storageMappings: {
        edges: {
            cursor: string;
            node: {
                catalogPrefix: string;
                storage: unknown;
            };
        }[];
    };
}

const QUERY = gql<StorageMappingsQueryResponse, { underPrefix: string }>`
    query StorageMappingQuery($underPrefix: Prefix!) {
        storageMappings(by: { underPrefix: $underPrefix }) {
            edges {
                cursor
                node {
                    catalogPrefix
                    storage
                }
            }
        }
    }
`;

// Maps cloud provider names to storage provider variants (for GraphQL mutations)
const CLOUD_TO_STORAGE_PROVIDER: Record<CloudProvider, StorageProvider> = {
    GCP: 'GCS',
    AWS: 'S3',
    AZURE: 'AZURE',
};

// Maps storage provider variants (from server) back to cloud provider names
const STORAGE_TO_CLOUD_PROVIDER: Record<StorageProvider, CloudProvider> = {
    GCS: 'GCP',
    S3: 'AWS',
    AZURE: 'AZURE',
};

function cloudProviderToStorageProvider(
    cloudProvider: CloudProvider
): StorageProvider {
    return CLOUD_TO_STORAGE_PROVIDER[cloudProvider];
}

export function storageProviderToCloudProvider(
    storageProvider: StorageProvider
): CloudProvider {
    return STORAGE_TO_CLOUD_PROVIDER[storageProvider];
}

// Real GraphQL implementation
const testStorageConnection = async (
    client: Client,
    catalogPrefix: string,
    dataPlanes: DataPlaneNode[],
    stores: FragmentStore[]
): Promise<TestConnectionHealthResult[]> => {
    // Convert cloud provider names to storage provider format for the server
    console.log('Converting stores for server:', stores);
    const serverStores = stores.map((store) => ({
        ...store,
        provider: cloudProviderToStorageProvider(store.provider),
    }));

    console.log('Testing storage connection with:', {
        catalogPrefix,
        dataPlanes,
        stores: serverStores,
    });
    const result = await client.mutation(TEST_CONNECTION_HEALTH, {
        catalogPrefix,
        storage: {
            stores: serverStores,
            data_planes: dataPlanes.map((dp) => dp.dataPlaneName),
        },
    } satisfies TestConnectionHealthVariables);

    if (result.error) {
        console.log('GraphQL Error:', result.error);
        throw new Error(
            result.error.graphQLErrors?.[0]?.message ??
                result.error.message ??
                'Failed to test connection health'
        );
    }

    // Convert storage provider names back to cloud provider format
    const return_me =
        result.data?.testConnectionHealth?.results.map((r) => ({
            fragmentStore: {
                ...r.fragmentStore,
                provider: storageProviderToCloudProvider(
                    r.fragmentStore.provider
                ),
            },
            dataPlaneName: r.dataPlaneName,
            error: r.error,
        })) ?? [];

    // console.log('GraphQL Test Connection Results:', return_me);
    return return_me;
};

// Real GraphQL implementation for creating storage mapping
const realCreateStorageMapping = async (
    client: Client,
    input: CreateStorageMappingInput
): Promise<CreateStorageMappingResult> => {
    // Convert cloud provider names to storage provider format for the server
    const serverInput = {
        ...input,
        storage: {
            ...input.storage,
            stores: input.storage.stores.map((store) => ({
                ...store,
                provider: cloudProviderToStorageProvider(store.provider),
            })),
        },
    };

    const result = await client.mutation(CREATE_STORAGE_MAPPING, serverInput);

    if (result.error) {
        throw new Error(
            result.error.graphQLErrors?.[0]?.message ??
                result.error.message ??
                'Failed to create storage mapping'
        );
    }

    if (!result.data?.createStorageMapping) {
        throw new Error('No response from createStorageMapping mutation');
    }

    return result.data.createStorageMapping;
};

// Real GraphQL implementation for updating storage mapping
const realUpdateStorageMapping = async (
    client: Client,
    input: CreateStorageMappingInput
): Promise<UpdateStorageMappingResult> => {
    const serverInput = {
        ...input,
        storage: {
            ...input.storage,
            stores: input.storage.stores.map((store) => ({
                ...store,
                provider: cloudProviderToStorageProvider(store.provider),
            })),
        },
    };

    const result = await client.mutation(UPDATE_STORAGE_MAPPING, serverInput);

    if (result.error) {
        throw new Error(
            result.error.graphQLErrors?.[0]?.message ??
                result.error.message ??
                'Failed to update storage mapping'
        );
    }

    if (!result.data?.updateStorageMapping) {
        console.log('GraphQL Response:', result);
        throw new Error('No response from updateStorageMapping mutation');
    }

    return result.data.updateStorageMapping;
};

// Hook that provides storage mapping service methods
export function useStorageMappingService() {
    const client = useClient();

    const testConnection = useCallback(
        async (
            catalogPrefix: string,
            dataPlanes: DataPlaneNode[],
            stores: FragmentStore[]
        ): Promise<TestConnectionHealthResult[]> =>
            await testStorageConnection(
                client,
                catalogPrefix,
                dataPlanes,
                stores
            ),
        [client]
    );

    const testSingleConnection = useCallback(
        async (
            catalogPrefix: string,
            dataPlane: DataPlaneNode,
            store: FragmentStore
        ): Promise<TestConnectionHealthResult> => {
            const results = await testConnection(
                catalogPrefix,
                [dataPlane],
                [store]
            );
            console.log('Single connection test results:', results);
            return results[0];
        },
        [testConnection]
    );

    const create = useCallback(
        async (
            input: CreateStorageMappingInput
        ): Promise<CreateStorageMappingResult> => {
            return realCreateStorageMapping(client, input);
        },
        [client]
    );

    const update = useCallback(
        async (
            input: CreateStorageMappingInput
        ): Promise<UpdateStorageMappingResult> => {
            return realUpdateStorageMapping(client, input);
        },
        [client]
    );

    return {
        testConnection,
        testSingleConnection,
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

    const storageMappings =
        data?.storageMappings.edges.map((edge) => edge.node) ?? [];

    return {
        storageMappings,
        loading: fetching,
        error,
    };
}
