import type { Client } from 'urql';
import type {
    ConnectionTestResult,
    ConnectionTestResults,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { gql } from 'urql';

// Toggle for mock mode while GraphQL backend is in development
const USE_MOCK = true;

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
    _formData: StorageMappingFormData,
    dataPlaneIds: string[]
): Promise<ConnectionTestResults> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const results: ConnectionTestResults = {};

    dataPlaneIds.forEach((id) => {
        // 50% success rate for demo purposes
        const success = Math.random() > 0.5;
        results[id] = success
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
    dataPlaneIds: string[]
): ConnectionTestResults => {
    const results: ConnectionTestResults = {};

    // Initialize all as success (will be overwritten if errors found)
    dataPlaneIds.forEach((id) => {
        results[id] = { status: 'success' };
    });

    // Process errors from extensions
    errors.forEach((error) => {
        const healthCheckErrors = error.extensions?.healthCheckErrors;
        if (healthCheckErrors) {
            healthCheckErrors.forEach((hcError) => {
                // Match error to data plane by prefix
                const matchingDataPlane = dataPlaneIds.find(
                    (id) =>
                        hcError.dataPlane === id ||
                        hcError.dataPlane.startsWith(id)
                );

                if (matchingDataPlane) {
                    results[matchingDataPlane] = {
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
    formData: StorageMappingFormData,
    dataPlaneIds: string[]
): Promise<ConnectionTestResults> => {
    const result = await client.mutation(CREATE_STORAGE_MAPPING, {
        catalogPrefix: formData.catalog_prefix,
        storage: {
            stores: [
                {
                    provider: formData.provider,
                    bucket: formData.bucket,
                    prefix: formData.storage_prefix || undefined,
                },
            ],
            data_planes: dataPlaneIds,
        },
        dryRun: true,
    });

    if (result.error?.graphQLErrors && result.error.graphQLErrors.length > 0) {
        return parseHealthCheckErrors(result.error.graphQLErrors, dataPlaneIds);
    }

    // No errors means all connections succeeded
    const results: ConnectionTestResults = {};
    dataPlaneIds.forEach((id) => {
        results[id] = { status: 'success' };
    });
    return results;
};

// Main export - tests storage connection for all specified data planes
export const testStorageConnection = async (
    client: Client | null,
    formData: StorageMappingFormData,
    dataPlaneIds: string[]
): Promise<ConnectionTestResults> => {
    if (USE_MOCK) {
        return mockTestStorageConnection(formData, dataPlaneIds);
    }

    if (!client) {
        throw new Error('URQL client is required for GraphQL operations');
    }

    return realTestStorageConnection(client, formData, dataPlaneIds);
};

// Export for testing individual data plane (used for retry)
export const testSingleDataPlaneConnection = async (
    client: Client | null,
    formData: StorageMappingFormData,
    dataPlaneId: string
): Promise<ConnectionTestResult> => {
    const results = await testStorageConnection(client, formData, [dataPlaneId]);
    return results[dataPlaneId] ?? { status: 'error', errorMessage: 'Unknown error' };
};
