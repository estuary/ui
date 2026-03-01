import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore as ApiFragmentStore } from 'src/api/storageMappingsGql';

export type CloudProvider = 'AWS' | 'GCP' | 'AZURE';

export const AWS_REGIONS: string[] = [
    'af-south-1',
    'ap-east-1',
    'ap-east-2',
    'ap-northeast-1',
    'ap-northeast-2',
    'ap-northeast-3',
    'ap-south-1',
    'ap-south-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-southeast-3',
    'ap-southeast-4',
    'ap-southeast-5',
    'ap-southeast-6',
    'ap-southeast-7',
    'ca-central-1',
    'ca-west-1',
    'eu-central-1',
    'eu-central-2',
    'eu-north-1',
    'eu-south-1',
    'eu-south-2',
    'eu-west-1',
    'eu-west-2',
    'eu-west-3',
    'il-central-1',
    'me-central-1',
    'me-south-1',
    'mx-central-1',
    'sa-east-1',
    'us-east-1',
    'us-east-2',
    'us-gov-east-1',
    'us-gov-west-1',
    'us-west-1',
    'us-west-2',
];

export const PROVIDER_LABELS: Record<CloudProvider, string> = {
    AWS: 'Amazon S3',
    GCP: 'Google Cloud Storage',
    AZURE: 'Azure Blob Storage',
};

export interface FragmentStore {
    provider: CloudProvider;
    region?: string | null;
    bucket?: string | null;
    storage_prefix?: string | null;

    // Azure-specific fields
    container_name?: string | null;
    storage_account_name?: string | null;
    account_tenant_id?: string | null;

    // _isNew is metadata to track whether this store was added in the update flow
    // failing connection tests to newly added stores block the user from saving
    _isNew?: boolean;

    // _isPending is metadata to track whether the store subform is open in the storage locations card
    // (and thus should block the user from advancing to connection tests)
    _isPending?: boolean;
}

export interface FormDataPlane extends DataPlaneNode {
    // _isNew is metadata to track whether this data plane was added in the update flow
    // failing connection tests to newly added data planes block the user from saving
    _isNew?: boolean;
}

export interface StorageMappingFormData {
    catalog_prefix: string;
    data_planes: FormDataPlane[];
    fragment_stores: FragmentStore[];
    allow_public: boolean;
}

/**
 * Converts a form FragmentStore to the shape expected by the API.
 * Maps Azure-specific field names and strips form metadata.
 */
export function toApiStore(
    store: FragmentStore
): ApiFragmentStore {
    const base = {
        provider: store.provider,
        prefix: store.storage_prefix || undefined,
    };

    switch (store.provider) {
        case 'GCP':
            return { ...base, bucket: store.bucket };
        case 'AWS':
            return { ...base, bucket: store.bucket, region: store.region };
        case 'AZURE':
            return {
                ...base,
                containerName: store.container_name,
                storageAccountName: store.storage_account_name,
                accountTenantId: store.account_tenant_id,
            };
    }
}
