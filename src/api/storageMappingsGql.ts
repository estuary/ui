import type { Client } from 'urql';

import { useCallback } from 'react';

import { DataPlaneNode } from './dataPlanesGql';
import { gql, useClient } from 'urql';

import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

// Cloud provider values used by consumers of this service
export type CloudProvider = `${CloudProviderCodes}`;

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

// Maps cloud provider names to storage provider variants (for GraphQL mutations)
const CLOUD_TO_STORAGE_PROVIDER: Record<string, string> = {
    gcp: 'GCS',
    aws: 'S3',
    azure: 'AZURE',
};

// Maps storage provider variants (from server) back to cloud provider names
const STORAGE_TO_CLOUD_PROVIDER: Record<string, string> = {
    GCS: 'gcp',
    S3: 'aws',
    AZURE: 'azure',
};

function cloudProviderToStorageProvider(
    cloudProvider: CloudProvider
): StorageProvider {
    return CLOUD_TO_STORAGE_PROVIDER[cloudProvider] as StorageProvider;
}

function storageProviderToCloudProvider(
    storageProvider: StorageProvider
): CloudProvider {
    return STORAGE_TO_CLOUD_PROVIDER[storageProvider] as CloudProvider;
}

// Real GraphQL implementation
const realTestStorageConnection = async (
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

// Hook that provides storage mapping service methods
export function useStorageMappingService() {
    const client = useClient();

    const testConnection = useCallback(
        async (
            catalogPrefix: string,
            dataPlanes: DataPlaneNode[],
            stores: FragmentStore[]
        ): Promise<TestConnectionHealthResult[]> => {
            const response = await realTestStorageConnection(
                client,
                catalogPrefix,
                dataPlanes,
                stores
            );
            return response;
        },
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

    return {
        testConnection,
        testSingleConnection,
        create,
    };
}
