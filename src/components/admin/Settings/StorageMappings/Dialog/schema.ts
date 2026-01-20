import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';

export interface StorageMappingFormData {
    catalog_prefix: string;
    provider: CloudProviderCodes | '';
    region: string;
    bucket: string;
    storage_prefix: string;
    data_plane: string;
    select_additional: boolean;
}
