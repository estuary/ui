import type { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';

export interface StorageMappingFormData {
    catalog_prefix: string;
    provider: CloudProviderCodes | '';
    region: string;
    bucket: string;
    storage_prefix: string;
    data_planes: string[];
    select_additional: boolean;
    use_same_region: boolean;
    allow_public: boolean;
}

export interface ConnectionTestResult {
    status: 'idle' | 'testing' | 'success' | 'error';
    errorMessage?: string;
}

export type ConnectionTestResults = Record<string, ConnectionTestResult>;
