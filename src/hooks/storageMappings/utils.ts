import type {
    StorageMappingDataPlane,
    StorageMappingInput,
} from 'src/api/gql/storageMappings';
import type { StorageMappingsQuery } from 'src/gql-types/graphql';

const COLLECTION_DATA_SUFFIX = 'collection-data/';

// api types that are converted to application types to be used downstream
type StorageMappingNode =
    StorageMappingsQuery['storageMappings']['edges'][number]['node'];
type StorageMappingFragmentStoreNode =
    StorageMappingNode['fragmentStores'][number];

// Shape of the storage mapping `spec` field, which the schema types as JSON.
// The server omits `data_planes` from the JSON when the list is empty
// (serde `skip_serializing_if`), so reads must treat it as optional. Writes
// always include it.
//
// TODO: Keeping this in order to preserver the shape of the data the server
// expects. Remove this when the create mutation is updated to using strucuted
// input fields.
interface StorageMappingSpec {
    data_planes?: string[];
    stores: {
        prefix?: string | null;
        provider: 'GCS' | 'S3' | 'AZURE' | 'CUSTOM';
        bucket?: string | null;
        region?: string | null;

        // Azure-specific
        container_name?: string | null;
        storage_account_name?: string | null;
        account_tenant_id?: string | null;
    }[];
}
type StorageMappingSpecStore = StorageMappingSpec['stores'][number];

export function toServerSpec(
    dataPlaneNames: StorageMappingInput['dataPlaneNames'],
    fragmentStores: StorageMappingInput['fragmentStores']
): StorageMappingSpec {
    const stores: StorageMappingSpec['stores'] = fragmentStores.map((s) => ({
        prefix: s.prefix,
        provider: s.provider,
        bucket: s.bucket,
        region: s.region,
        container_name: s.containerName,
        storage_account_name: s.storageAccountName,
        account_tenant_id: s.accountTenantId,
    }));

    return { data_planes: dataPlaneNames, stores };
}

export function stripCollectionDataSuffix(
    prefix?: string | null
): string | null | undefined {
    if (
        prefix !== COLLECTION_DATA_SUFFIX &&
        !prefix?.endsWith(`/${COLLECTION_DATA_SUFFIX}`)
    ) {
        return prefix;
    }

    const base = prefix.slice(0, -COLLECTION_DATA_SUFFIX.length);
    return base || null;
}

type CloudProvider = StorageMappingDataPlane['cloudProvider'];
type StoreProvider = StorageMappingDataPlane['storeProvider'];

export function toCloudProvider(
    storeProvider: StoreProvider
): CloudProvider | null {
    switch (storeProvider) {
        case 'S3':
            return 'AWS';
        case 'GCS':
            return 'GCP';
        case 'AZURE':
            return 'AZURE';
        default:
            return null;
    }
}

export function toStoreProvider(
    cloudProvider?: CloudProvider
): StoreProvider | null {
    switch (cloudProvider) {
        case 'AWS':
            return 'S3';
        case 'AZURE':
            return 'AZURE';
        case 'GCP':
            return 'GCS';
        default:
            return null;
    }
}

export function getStoreKey(store: StorageMappingFragmentStoreNode): string {
    const prefix = stripCollectionDataSuffix(store.prefix);
    if (store.provider === 'AZURE') {
        return `AZ/${store.storageAccountName}/${store.containerName}/${prefix ?? ''}`;
    }
    return `${store.provider}/${store.bucket}/${prefix ?? ''}`;
}

// TODO: figure out how to make this private
export function getStoreKeyForSpec(store: StorageMappingSpecStore): string {
    if (store.provider === 'AZURE') {
        return `AZ/${store.storage_account_name}/${store.container_name}/${store.prefix ?? ''}`;
    }
    return `${store.provider}/${store.bucket}/${store.prefix ?? ''}`;
}
