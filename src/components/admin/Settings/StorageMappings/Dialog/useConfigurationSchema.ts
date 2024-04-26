import { JsonFormsProps } from '@jsonforms/core';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import { useMemo } from 'react';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { EnumDictionary } from 'types/utils';
import { PREFIX_NAME_PATTERN } from 'utils/misc-utils';

export enum CloudProviderCodes {
    GCS = 'GCS',
    S3 = 'S3',
}

// TODO (storageMappings): Determine whether this type should require the selected schema properties.
type JsonFormsSchemas = Pick<JsonFormsProps, 'schema' | 'uischema'>;

// The Azure and custom cloud provider options are not supported at this time. All provider schemas originate from:
//    https://github.com/estuary/flow/blob/94f3077dbc5e9a34e51e9738acf934a5bd4ff788/crates/models/src/snapshots/models__journals__test__storage-json-schema.snap

const prefixPattern = `^(${PREFIX_NAME_PATTERN}/)*$`;

const gcsProviderSchema = {
    title: 'Google Cloud Storage.',
    examples: [
        {
            bucket: 'my-bucket',
        },
    ],
    type: 'object',
    required: ['bucket'],
    properties: {
        bucket: {
            description: 'Bucket into which Flow will store data.',
            type: 'string',
            pattern: '(^[a-z0-9][a-z0-9\\-_\\.]{1,60}[a-z0-9]$)',
        },
        prefix: {
            description: 'Optional prefix of keys written to the bucket.',
            type: 'string',
            pattern: prefixPattern,
        },
    },
};

const s3ProviderSchema = {
    title: 'Amazon Simple Storage Service.',
    examples: [
        {
            bucket: 'my-bucket',
            region: null,
        },
    ],
    type: 'object',
    required: ['bucket'],
    properties: {
        bucket: {
            description: 'Bucket into which Flow will store data.',
            type: 'string',
            pattern:
                '(^(([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])\\.)*([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])$)',
        },
        region: {
            description:
                'AWS region of the S3 bucket. Uses the default value from the AWS credentials of the Gazette broker if unset.',
            type: 'string',
        },
        prefix: {
            description: 'Optional prefix of keys written to the bucket.',
            type: 'string',
            pattern: prefixPattern,
        },
    },
};

const providerSchemas: EnumDictionary<CloudProviderCodes, JsonFormsSchemas> = {
    [CloudProviderCodes.GCS]: {
        schema: gcsProviderSchema,
        uischema: custom_generateDefaultUISchema(gcsProviderSchema),
    },
    [CloudProviderCodes.S3]: {
        schema: s3ProviderSchema,
        uischema: custom_generateDefaultUISchema(s3ProviderSchema),
    },
};

function useConfigurationSchema() {
    const provider = useStorageMappingStore((state) => state.provider);

    return useMemo(
        (): JsonFormsSchemas =>
            Object.hasOwn(providerSchemas, provider)
                ? providerSchemas[provider]
                : {},
        [provider]
    );
}

export default useConfigurationSchema;
