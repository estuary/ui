import type { StorageMapping } from 'src/api/gql/storageMappings';

export interface StorageMappingFormData {
    catalogPrefix: StorageMapping['catalogPrefix'];
    dataPlanes: StorageMapping['dataPlanes'];
    fragmentStores: StorageMapping['fragmentStores'];
    allowPublic: boolean;
}
