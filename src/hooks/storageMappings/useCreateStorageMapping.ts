import type { StorageMappingInput } from 'src/api/gql/storageMappings';

import { useCallback } from 'react';

import { useClient } from 'urql';

import { graphql } from 'src/gql-types';
import { useStorageMappingsVersion } from 'src/hooks/storageMappings/useStorageMappingsVersion';
import { toServerSpec } from 'src/hooks/storageMappings/utils';

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
            storageMapping {
                catalogPrefix
            }
        }
    }
`);

export function useCreateStorageMapping() {
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
            const result = await client.mutation(CREATE_STORAGE_MAPPING, {
                catalogPrefix,
                spec,
                detail,
            });

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

            notifyChange();
            return result.data.createStorageMapping.storageMapping;
        },
        [client, notifyChange]
    );
}
