import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { FragmentStore } from 'src/api/gql/storageMappings';

export interface StorageMappingFormData {
    catalogPrefix: string;
    dataPlanes: DataPlaneNode[];
    fragmentStores: FragmentStore[];
    allowPublic: boolean;
}
