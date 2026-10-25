import type {
    FragmentStore,
    StorageMappingsQuery,
    StorageMappingsTableQuery,
} from 'src/gql-types/graphql';

type StorageMappingNode =
    StorageMappingsQuery['storageMappings']['edges'][number]['node'];

export type StorageMappingDataPlane =
    StorageMappingNode['dataPlanes'][number] & {
        displayName: string;
        storeProvider: StorageMappingFragmentStore['provider'] | null;
    };

export type StorageMappingFragmentStore =
    StorageMappingNode['fragmentStores'][number] & {
        key: string;
        cloudProvider: StorageMappingDataPlane['cloudProvider'] | null;
    };

export type StorageMapping = {
    catalogPrefix: StorageMappingNode['catalogPrefix'];
    dataPlanes: StorageMappingDataPlane[];
    fragmentStores: StorageMappingFragmentStore[];
};

export interface StorageMappingInput {
    catalogPrefix: string;
    dataPlaneNames: string[];
    fragmentStores: FragmentStore[];
    detail?: string;
}

export type StorageMappingsTableRow =
    StorageMappingsTableQuery['storageMappings']['edges'][number]['node'];

type StorageMappingConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

export interface StorageMappingConnection {
    key: string;
    dataPlane: StorageMappingDataPlane;
    fragmentStore: StorageMappingFragmentStore;
    status: StorageMappingConnectionStatus;
    error?: string | null;
}

// export function cloudToStorageProvider(
//     cloudProvider?: StorageMappingDataPlane['cloudProvider']
// ): StorageMappingFragmentStore['provider'] | null {
//     if (!cloudProvider) {
//         return null;
//     }

//     switch (cloudProvider) {
//         case 'AWS':
//             return 'S3';
//         case 'AZURE':
//             return 'AZURE';
//         case 'GCP':
//             return 'GCS';
//         case 'LOCAL':
//             return null;
//     }
// }

// interface TestConnectionHealthResult {
//     fragmentStore: StorageMappingFragmentStore;
//     dataPlaneName: string;
//     error: string | null;
// }

// Internal types
// type StorageProvider = StorageMappingFragmentStore['provider'];

// interface ServerFragmentStore {
//     provider: StorageProvider;
//     bucket?: string | null;
//     region?: string | null;
//     prefix?: string | null;

//     // Azure-specific
//     container_name?: string | null;
//     storage_account_name?: string | null;
//     account_tenant_id?: string | null;
// }

// // Shape of the storage mapping `spec` field, which the schema types as JSON.
// // The server omits `data_planes` from the JSON when the list is empty
// // (serde `skip_serializing_if`), so reads must treat it as optional. Writes
// // always include it.
// interface StorageMappingSpec {
//     stores: ServerFragmentStore[];
//     data_planes?: string[];
// }

// interface StorageMappingVariables {
//     catalogPrefix: string;
//     spec: StorageMappingSpec;
//     detail?: string;
// }

// // GraphQL Mutations
// const CREATE_STORAGE_MAPPING = graphql(`
//     mutation CreateStorageMapping2(
//         $catalogPrefix: Prefix!
//         $spec: JSON!
//         $detail: String
//     ) {
//         createStorageMapping(
//             catalogPrefix: $catalogPrefix
//             spec: $spec
//             detail: $detail
//         ) {
//             catalogPrefix
//         }
//     }
// `);

// const UPDATE_STORAGE_MAPPING = graphql(`
//     mutation UpdateStorageMapping2(
//         $catalogPrefix: Prefix!
//         $spec: JSON!
//         $detail: String
//     ) {
//         updateStorageMapping(
//             catalogPrefix: $catalogPrefix
//             spec: $spec
//             detail: $detail
//         ) {
//             catalogPrefix
//             republish
//         }
//     }
// `);

// const TEST_CONNECTION_HEALTH = graphql(`
//     mutation TestConnectionHealth($catalogPrefix: Prefix!, $spec: JSON!) {
//         testConnectionHealth(catalogPrefix: $catalogPrefix, spec: $spec) {
//             results {
//                 fragmentStore
//                 dataPlaneName
//                 error
//             }
//         }
//     }
// `);

// function toServerStore(
//     store: StorageMappingFragmentStore
// ): ServerFragmentStore {
//     return {
//         provider: store.provider,
//         bucket: store.bucket,
//         region: store.region,
//         prefix: store.prefix,
//         container_name: store.containerName,
//         storage_account_name: store.storageAccountName,
//         account_tenant_id: store.accountTenantId,
//     };
// }

// function fromServerStore(
//     store: ServerFragmentStore
// ): StorageMappingFragmentStore {
//     return {
//         provider: store.provider,
//         bucket: store.bucket,
//         region: store.region,
//         prefix: store.prefix,
//         containerName: store.container_name,
//         storageAccountName: store.storage_account_name,
//         accountTenantId: store.account_tenant_id,
//     };
// }

// export function useStorageMappingService() {
//     const client = useClient();

//     const testConnection = useCallback(
//         async (
//             catalogPrefix: string,
//             dataPlanes: StorageMappingDataPlane[],
//             stores: StorageMappingFragmentStore[]
//         ): Promise<TestConnectionHealthResult[]> => {
//             const result = await client.mutation(TEST_CONNECTION_HEALTH, {
//                 catalogPrefix,
//                 spec: {
//                     stores: stores.map(toServerStore),
//                     data_planes: dataPlanes.map((dp) => dp.name),
//                 },
//             } satisfies StorageMappingVariables);

//             if (result.error) {
//                 throw new Error(
//                     result.error.graphQLErrors?.[0]?.message ??
//                         result.error.message ??
//                         'Failed to test connection health'
//                 );
//             }

//             return (
//                 result.data?.testConnectionHealth?.results.map((r) => ({
//                     fragmentStore: fromServerStore(r.fragmentStore),
//                     dataPlaneName: r.dataPlaneName,
//                     error: r.error ?? null,
//                 })) ?? []
//             );
//         },
//         [client]
//     );

//     return {
//         testConnection,
//     };
// }
