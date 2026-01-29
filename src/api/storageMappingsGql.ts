import type {
    ConnectionTestResult,
    ConnectionTestResults,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { Client } from 'urql';

import { useCallback } from 'react';

import { DataPlaneNode } from './dataPlanesGql';
import { gql, useClient } from 'urql';

// Toggle for mock mode while GraphQL backend is in development
const USE_MOCK = false;

// GraphQL Types
interface HealthCheckError {
    dataPlane: string;
    error: string;
    fragmentStore: string;
}

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
        stores: Array<{
            provider: string;
            bucket: string;
            prefix?: string;
        }>;
        data_planes: string[];
    };
    detail?: string;
    dryRun: boolean;
}

type CreateStorageMappingInput = Omit<CreateStorageMappingVariables, 'dryRun'>;

// GraphQL Mutation
const CREATE_STORAGE_MAPPING = gql<
    CreateStorageMappingResponse,
    CreateStorageMappingVariables
>`
    mutation CreateStorageMapping(
        $catalogPrefix: Prefix!
        $storage: JSON!
        $detail: String
        $dryRun: Boolean!
    ) {
        createStorageMapping(
            catalogPrefix: $catalogPrefix
            storage: $storage
            detail: $detail
            dryRun: $dryRun
        ) {
            created
            catalogPrefix
        }
    }
`;

// Mock implementation for development
const mockTestStorageConnection = async (
    _input: CreateStorageMappingInput,
    dataPlanes: DataPlaneNode[]
): Promise<ConnectionTestResults> => {
    // Simulate network delay
    await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 1500) + 1000)
    );

    const results: ConnectionTestResults = {};

    dataPlanes.forEach((dp) => {
        // 50% success rate for demo purposes
        const success = Math.random() > 0.5;
        results[dp.dataPlaneName] = success
            ? { status: 'success' }
            : {
                  status: 'error',
                  errorMessage:
                      'Unable to access bucket. Please verify your bucket name and permissions.',
              };
    });

    return results;
};

// Parse GraphQL errors to extract health check errors per data plane
const parseHealthCheckErrors = (
    errors: Array<{ extensions?: { healthCheckErrors?: HealthCheckError[] } }>,
    dataPlanes: DataPlaneNode[]
): ConnectionTestResults => {
    const results: ConnectionTestResults = {};

    // Initialize all as success (will be overwritten if errors found)
    dataPlanes.forEach((dp) => {
        results[dp.dataPlaneName] = { status: 'success' };
    });

    // Process errors from extensions
    errors.forEach((error) => {
        const healthCheckErrors = error.extensions?.healthCheckErrors;
        if (healthCheckErrors) {
            healthCheckErrors.forEach((hcError) => {
                // Match error to data plane by name
                const matchingDataPlane = dataPlanes.find(
                    (dp) =>
                        hcError.dataPlane === dp.dataPlaneName ||
                        hcError.dataPlane.startsWith(dp.dataPlaneName + ':')
                );

                if (matchingDataPlane) {
                    results[matchingDataPlane.dataPlaneName] = {
                        status: 'error',
                        errorMessage: hcError.error,
                    };
                }
            });
        }
    });

    return results;
};

// Real GraphQL implementation
const realTestStorageConnection = async (
    client: Client,
    input: CreateStorageMappingInput,
    dataPlanes: DataPlaneNode[]
): Promise<ConnectionTestResults> => {
    const result = await client.mutation(CREATE_STORAGE_MAPPING, {
        ...input,
        dryRun: true,
    });

    if (result.error?.graphQLErrors && result.error.graphQLErrors.length > 0) {
        return parseHealthCheckErrors(result.error.graphQLErrors, dataPlanes);
    }

    // No errors means all connections succeeded
    const results: ConnectionTestResults = {};
    dataPlanes.forEach((dp) => {
        results[dp.dataPlaneName] = { status: 'success' };
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
    const result = await client.mutation(CREATE_STORAGE_MAPPING, {
        ...input,
        dryRun: false,
    });

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
            input: CreateStorageMappingInput,
            dataPlanes: DataPlaneNode[]
        ): Promise<ConnectionTestResults> => {
            if (USE_MOCK) {
                return mockTestStorageConnection(input, dataPlanes);
            }
            return realTestStorageConnection(client, input, dataPlanes);
        },
        [client]
    );

    const testSingleConnection = useCallback(
        async (
            input: CreateStorageMappingInput,
            dataPlane: DataPlaneNode
        ): Promise<ConnectionTestResult> => {
            const results = await testConnection(input, [dataPlane]);
            return (
                results[dataPlane.dataPlaneName] ?? {
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
