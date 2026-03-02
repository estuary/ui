import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore } from 'src/api/storageMappingsGql';

export interface StorageMappingFormData {
    catalogPrefix: string;
    dataPlanes: DataPlaneNode[];
    fragmentStores: FragmentStore[];
    allowPublic: boolean;
}
