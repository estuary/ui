import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { StorageMapping } from 'src/api/gql/storageMappings';
import type { StorageMappingsQuery } from 'src/gql-types/graphql';

import { useAllPages } from 'src/api/gql/useAllPages';
import { graphql } from 'src/gql-types';
import { useStorageMappingsVersion } from 'src/hooks/storageMappings/useStorageMappingsVersion';
import {
    getStoreKey,
    stripCollectionDataSuffix,
    toCloudProvider,
    toStoreProvider,
} from 'src/hooks/storageMappings/utils';
import {
    formatDataPlaneName,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';

type StorageMappingNode =
    StorageMappingsQuery['storageMappings']['edges'][number]['node'];

// The server caps each page at its DEFAULT_PAGE_SIZE (50); useAllPages walks
// every page so consumers see the complete mapping list.
const QUERY = graphql(`
    query StorageMappings($prefix: String!, $after: String) {
        storageMappings(
            filter: { catalogPrefix: { startsWith: $prefix } }
            after: $after
        ) {
            edges {
                cursor
                node {
                    catalogPrefix
                    dataPlanes {
                        name
                        cloudProvider
                        region
                        isPublic
                        closed
                        fqdn
                        cidrBlocks
                        awsIamUserArn
                        gcpServiceAccountEmail
                        azureApplicationClientId
                        azureApplicationName
                    }
                    fragmentStores {
                        provider
                        prefix
                        bucket
                        region
                        storageAccountName
                        containerName
                        accountTenantId
                        endpoint
                    }
                }
            }
            pageInfo {
                ...PageInfoFields
            }
        }
    }
`);

// Fetches every storage mapping the user can read. Consumers rely on the
// list being complete: the edit dialog resolves its clicked row from it, and
// PrefixCard's duplicate/coverage validators reject prefixes based on it.
export function useStorageMappingsQuery(tenant: string) {
    const { version } = useStorageMappingsVersion();

    const { data, loading, error } = useAllPages(QUERY, {
        variables: { prefix: tenant },
        getConnection: (d) => d.storageMappings,
        transform: transformStorageMapping,
        pause: !tenant,
        resetKey: version,
    });

    return {
        data,
        loading,
        error,
    };
}

function transformStorageMapping(mapping: StorageMappingNode): StorageMapping {
    const dataPlanes = transformDataPlanes(mapping.dataPlanes);
    const fragmentStores = transformFragmentStores(mapping.fragmentStores);
    return { ...mapping, dataPlanes, fragmentStores };
}

function transformDataPlanes(
    nodes: StorageMappingNode['dataPlanes']
): StorageMapping['dataPlanes'] {
    return nodes.map((node) => {
        const displayName = getDataPlaneDisplayName(node);
        const storeProvider = toStoreProvider(node.cloudProvider);
        return { ...node, displayName, storeProvider };
    });
}

function transformFragmentStores(
    nodes: StorageMappingNode['fragmentStores']
): StorageMapping['fragmentStores'] {
    return nodes.map((node) => {
        const key = getStoreKey(node);
        const prefix = stripCollectionDataSuffix(node.prefix);
        const cloudProvider = toCloudProvider(node.provider);
        return { ...node, key, prefix, cloudProvider };
    });
}

function getDataPlaneDisplayName(
    node: StorageMappingNode['dataPlanes'][number]
): string {
    const scope: DataPlaneNode['scope'] = node.isPublic ? 'public' : 'private';
    const dataPlaneName = parseDataPlaneName(node.name, scope);
    return formatDataPlaneName(dataPlaneName);
}
