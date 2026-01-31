import type { ConnectionTestResult } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { Client } from 'urql';

import { useCallback } from 'react';

import { DataPlaneNode } from './dataPlanesGql';
import { gql, useClient } from 'urql';

import { ConnectionTestResults } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTestContext';

// Toggle for mock mode while GraphQL backend is in development
const USE_MOCK = false;

export interface FragmentStore {
    provider: string;
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
        stores: FragmentStore[];
        data_planes: string[];
    };
    detail?: string;
}

interface TestConnectionHealthResult {
    fragmentStore: string;
    dataPlaneName: string;
    error: string | null;
}

interface TestConnectionHealthResponse {
    testConnectionHealth: {
        results: TestConnectionHealthResult[];
    } | null;
}

interface TestConnectionHealthVariables {
    catalogPrefix: string;
    storage: {
        stores: FragmentStore[];
        data_planes: string[];
    };
}

type CreateStorageMappingInput = CreateStorageMappingVariables;

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
            created
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

// Maps cloud provider names (from data planes) to storage provider variants (for GraphQL)
const CLOUD_TO_STORAGE_PROVIDER: Record<string, string> = {
    gcp: 'GCS',
    aws: 'S3',
    azure: 'AZURE',
};

export function cloudProviderToStorageProvider(cloudProvider: string): string {
    return CLOUD_TO_STORAGE_PROVIDER[cloudProvider.toLowerCase()] ?? 'CUSTOM';
}

// function parseBucketUrl(bucketUrl: string): FragmentStore {
//     // {provider}://{bucket}/{optional_prefix}/
//     const match = bucketUrl.match(/^([^:]+):\/\/([^/]+)\/?(.*)$/);
//     if (!match) {
//         throw new Error(`Invalid bucket URL format: ${bucketUrl}`);
//     }

//     const [, provider, bucket, prefix] = match;
//     return {
//         provider: cloudProviderToStorageProvider(provider),
//         bucket,
//         ...(prefix ? { prefix: prefix.replace(/\/$/, '') } : {}),
//     };
// }

// Mock implementation for development
const mockTestStorageConnection = async (
    dataPlanes: DataPlaneNode[],
    stores: FragmentStore[]
): Promise<ConnectionTestResults> => {
    // Simulate network delay
    await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 1500) + 1000)
    );

    const results: ConnectionTestResults = new Map();

    dataPlanes.forEach((dp) => {
        stores.forEach((store) => {
            // 50% success rate for demo purposes
            const success = Math.random() > 0.5;
            results.set(
                [dp, store],
                success
                    ? { status: 'success' }
                    : {
                          status: 'error',
                          errorMessage:
                              'Unable to access bucket. Please verify your bucket name and permissions.',
                      }
            );
        });
    });

    return results;
};

// Real GraphQL implementation
const realTestStorageConnection = async (
    client: Client,
    catalogPrefix: string,
    dataPlanes: DataPlaneNode[],
    stores: FragmentStore[]
): Promise<ConnectionTestResults> => {
    const result = await client.mutation(TEST_CONNECTION_HEALTH, {
        catalogPrefix,
        storage: {
            stores,
            data_planes: dataPlanes.map((dp) => dp.dataPlaneName),
        },
    } satisfies TestConnectionHealthVariables);

    if (result.error) {
        throw new Error(
            result.error.graphQLErrors?.[0]?.message ??
                result.error.message ??
                'Failed to test connection health'
        );
    }

    const results: ConnectionTestResults = new Map();
    const testResults = result.data?.testConnectionHealth?.results ?? [];

    // Map results back to dataPlane/store pairs
    testResults.forEach((testResult) => {
        const matchingDataPlane = dataPlanes.find(
            (dp) =>
                testResult.dataPlaneName === dp.dataPlaneName ||
                testResult.dataPlaneName.startsWith(dp.dataPlaneName + ':')
        );

        const matchingStore = stores.find(
            (store) =>
                testResult.fragmentStore ===
                `${store.provider}://${store.bucket}${store.prefix ? `/${store.prefix}` : ''}`
        );

        if (matchingDataPlane && matchingStore) {
            results.set(
                [matchingDataPlane, matchingStore],
                testResult.error
                    ? { status: 'error', errorMessage: testResult.error }
                    : { status: 'success' }
            );
        }
    });

    return results;
};

// Mock implementation for creating storage mapping
const mockCreateStorageMapping = async (
    input: CreateStorageMappingInput
): Promise<CreateStorageMappingResult> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        created: true,
        catalogPrefix: input.catalogPrefix,
    };
};

// Real GraphQL implementation for creating storage mapping
const realCreateStorageMapping = async (
    client: Client,
    input: CreateStorageMappingInput
): Promise<CreateStorageMappingResult> => {
    const result = await client.mutation(CREATE_STORAGE_MAPPING, input);

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
        ): Promise<ConnectionTestResults> => {
            if (USE_MOCK) {
                return mockTestStorageConnection(dataPlanes, stores);
            }
            return realTestStorageConnection(
                client,
                catalogPrefix,
                dataPlanes,
                stores
            );
        },
        [client]
    );

    const testSingleConnection = useCallback(
        async (
            catalogPrefix: string,
            dataPlane: DataPlaneNode,
            store: FragmentStore
        ): Promise<ConnectionTestResult> => {
            const results = await testConnection(
                catalogPrefix,
                [dataPlane],
                [store]
            );
            return (
                results.get([dataPlane, store]) ?? {
                    status: 'error',
                    errorMessage: 'Unknown error',
                }
            );
        },
        [testConnection]
    );

    const create = useCallback(
        async (
            input: CreateStorageMappingInput
        ): Promise<CreateStorageMappingResult> => {
            if (USE_MOCK) {
                return mockCreateStorageMapping(input);
            }
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
