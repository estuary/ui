import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore as ApiFragmentStore } from 'src/api/storageMappingsGql';

import { CloudProvider } from 'src/utils/cloudRegions';

export interface FragmentStore {
    provider: CloudProvider;
    region?: string | null;
    bucket?: string | null;
    storage_prefix?: string | null;

    // Azure-specific fields
    container_name?: string | null;
    storage_account_name?: string | null;
    account_tenant_id?: string | null;
}

export interface StorageMappingFormData {
    catalog_prefix: string;
    data_planes: DataPlaneNode[];
    fragment_stores: FragmentStore[];
    allow_public: boolean;
}

/**
 * Converts a form FragmentStore to the shape expected by the API.
 * Maps Azure-specific field names and strips form metadata.
 */
export function toApiStore(store: FragmentStore): ApiFragmentStore {
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
