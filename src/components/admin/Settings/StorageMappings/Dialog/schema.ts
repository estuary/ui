import type { DataPlaneNode } from 'src/api/dataPlanesGql';

export type CloudProvider = 'AWS' | 'GCP' | 'AZURE';

const AWS_REGIONS: string[] = [
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

const GCP_REGIONS: string[] = [
    'africa-south1',
    'asia-east1',
    'asia-east2',
    'asia-northeast1',
    'asia-northeast2',
    'asia-northeast3',
    'asia-south1',
    'asia-south2',
    'asia-southeast1',
    'asia-southeast2',
    'australia-southeast1',
    'australia-southeast2',
    'europe-central2',
    'europe-north1',
    'europe-north2',
    'europe-southwest1',
    'europe-west1',
    'europe-west10',
    'europe-west12',
    'europe-west2',
    'europe-west3',
    'europe-west4',
    'europe-west6',
    'europe-west8',
    'europe-west9',
    'me-central1',
    'me-central2',
    'me-west1',
    'northamerica-northeast1',
    'northamerica-northeast2',
    'northamerica-south1',
    'southamerica-east1',
    'southamerica-west1',
    'us-central1',
    'us-east1',
    'us-east4',
    'us-east5',
    'us-south1',
    'us-west1',
    'us-west2',
    'us-west3',
    'us-west4',
];

const AZURE_REGIONS: string[] = [
    'africa-south1',
    'asia-east1',
    'asia-east2',
    'asia-northeast1',
    'asia-northeast2',
    'asia-northeast3',
    'asia-south1',
    'asia-south2',
    'asia-southeast1',
    'asia-southeast2',
    'australia-southeast1',
    'australia-southeast2',
    'europe-central2',
    'europe-north1',
    'europe-north2',
    'europe-southwest1',
    'europe-west1',
    'europe-west10',
    'europe-west12',
    'europe-west2',
    'europe-west3',
    'europe-west4',
    'europe-west6',
    'europe-west8',
    'europe-west9',
    'me-central1',
    'me-central2',
    'me-west1',
    'northamerica-northeast1',
    'northamerica-northeast2',
    'northamerica-south1',
    'southamerica-east1',
    'southamerica-west1',
    'us-central1',
    'us-east1',
    'us-east4',
    'us-east5',
    'us-south1',
    'us-west1',
    'us-west2',
    'us-west3',
    'us-west4',
];

export const RegionMap: Record<CloudProvider, string[]> = {
    AWS: AWS_REGIONS,
    GCP: GCP_REGIONS,
    AZURE: AZURE_REGIONS,
};

export const PROVIDER_LABELS: Record<CloudProvider, string> = {
    AWS: 'Amazon S3',
    GCP: 'Google Cloud Storage',
    AZURE: 'Azure Blob Storage',
};

export interface FragmentStore {
    provider: CloudProvider;
    region: string;
    bucket: string;
    storage_prefix?: string;

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
    default_data_plane: FormDataPlane | null;
    fragment_stores: FragmentStore[];
    allow_public: boolean;
    select_additional: boolean;
}

export const fragmentStoreValidation = {
    bucket: { required: 'Bucket is required' },
    provider: { required: 'Cloud provider is required' },
    region: { required: 'Region is required' },
} as const;
