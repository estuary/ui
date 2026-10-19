import type { StorageMappingInput } from 'src/api/gql/storageMappings';

import { useCallback } from 'react';

import { useClient } from 'urql';

import { graphql } from 'src/gql-types';
import {
    getStoreKeyForSpec,
    toServerSpec,
} from 'src/hooks/storageMappings/utils';

interface TestConnectionHealthInput {
    catalogPrefix: StorageMappingInput['catalogPrefix'];
    dataPlaneNames: StorageMappingInput['dataPlaneNames'];
    fragmentStores: StorageMappingInput['fragmentStores'];
}

interface TestConnectionHealthResult {
    dataPlaneName: string;
    storeKey: string;
    error?: string | null;
}

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

export function useTestConnectionHealth() {
    const client = useClient();

    return useCallback(
        async ({
            catalogPrefix,
            dataPlaneNames,
            fragmentStores,
        }: TestConnectionHealthInput): Promise<
            TestConnectionHealthResult[]
        > => {
            if (!catalogPrefix) return [];
            if (dataPlaneNames.length < 1) return [];
            if (fragmentStores.length < 1) return [];

            const spec = toServerSpec(dataPlaneNames, fragmentStores);
            const result = await client.mutation(TEST_CONNECTION_HEALTH, {
                catalogPrefix,
                spec,
            });

            if (result.error) {
                throw new Error(
                    result.error.graphQLErrors?.[0]?.message ??
                        result.error.message ??
                        'Failed to test connection health'
                );
            }

            return (
                result.data?.testConnectionHealth?.results.map((r) => ({
                    dataPlaneName: r.dataPlaneName,
                    storeKey: getStoreKeyForSpec(r.fragmentStore),
                    error: r.error ?? null,
                })) ?? []
            );
        },
        [client]
    );
}
