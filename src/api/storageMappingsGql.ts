import type { Client } from 'urql';

import { useCallback } from 'react';

import { DataPlaneNode } from './dataPlanesGql';
import { gql, useClient } from 'urql';

// Toggle for mock mode while GraphQL backend is in development

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

// Real GraphQL implementation
const realTestStorageConnection = async (
    client: Client,
    catalogPrefix: string,
    dataPlanes: DataPlaneNode[],
    stores: FragmentStore[]
): Promise<TestConnectionHealthResult[]> => {
    const result = await client.mutation(TEST_CONNECTION_HEALTH, {
        catalogPrefix,
        storage: {
            stores,
            data_planes: dataPlanes.map((dp) => dp.dataPlaneName),
        },
    } satisfies TestConnectionHealthVariables);

    // if (result.error) {
    //     throw new Error(
    //         result.error.graphQLErrors?.[0]?.message ??
    //             result.error.message ??
    //             'Failed to test connection health'
    //     );
    // }

    const return_me = [];
    // result.data?.testConnectionHealth?.results.map((r) => ({
    //     fragmentStore: parseFagmentStoreUrl(r.fragmentStore),
    //     dataPlaneName: r.dataPlaneName,
    //     error: r.error,
    // })) ?? [];

    console.log('GraphQL Test Connection Results:', return_me);
    return return_me;
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
