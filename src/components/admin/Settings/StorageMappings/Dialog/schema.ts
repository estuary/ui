import type { JSONSchemaType } from 'ajv';

import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';

export interface StorageMappingFormData {
    catalog_prefix: string;
    provider: CloudProviderCodes | '';
    region: string;
    bucket: string;
    storage_prefix: string;
    data_plane: string;
    select_multiple: boolean;
}

export const storageMappingSchema: JSONSchemaType<StorageMappingFormData> = {
    type: 'object',
    properties: {
        catalog_prefix: { type: 'string', minLength: 1 },
        provider: {
            type: 'string',
            enum: ['', ...Object.values(CloudProviderCodes)],
        },
        region: { type: 'string', minLength: 1 },
        bucket: { type: 'string', minLength: 1 },
        storage_prefix: { type: 'string' },
        data_plane: { type: 'string', minLength: 1 },
        select_multiple: { type: 'boolean' },
    },
    required: ['catalog_prefix', 'provider', 'region', 'bucket', 'data_plane'],
    additionalProperties: false,
};
