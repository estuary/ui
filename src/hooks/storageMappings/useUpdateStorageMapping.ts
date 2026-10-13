import type { StorageMappingInput } from 'src/api/gql/storageMappings';

import { useCallback } from 'react';

import { useClient } from 'urql';

import { graphql } from 'src/gql-types';
import { useStorageMappingsVersion } from 'src/hooks/storageMappings/useStorageMappingsVersion';
import { toServerSpec } from 'src/hooks/storageMappings/utils';

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
            storageMapping {
                catalogPrefix
            }
            republish
        }
    }
`);

export function useUpdateStorageMapping() {
    const { notifyChange } = useStorageMappingsVersion();
    const client = useClient();

    return useCallback(
        async ({
            catalogPrefix,
            dataPlaneNames,
            fragmentStores,
            detail,
        }: StorageMappingInput) => {
            const spec = toServerSpec(dataPlaneNames, fragmentStores);
            const result = await client.mutation(UPDATE_STORAGE_MAPPING, {
                catalogPrefix,
                spec,
                detail,
            });

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

            notifyChange();
            return result.data.updateStorageMapping;
        },
        [client, notifyChange]
    );
}
