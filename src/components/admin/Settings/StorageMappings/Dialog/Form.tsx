import { JsonForms } from '@jsonforms/react';
import { Stack, StyledEngineProvider } from '@mui/material';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import { jsonFormsPadding } from 'context/Theme';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { jsonFormsDefaults } from 'services/jsonforms/defaults';
import { CloudProviderCodes } from './ProviderSelector';

const providerSchemas = {
    [CloudProviderCodes.AZURE]: {
        title: 'Azure object storage service.',
        examples: [
            {
                account_tenant_id: '689f4ac1-038c-44cc-a1f9-8a65bc33386e',
                container_name: 'containername',
                storage_account_name: 'storageaccount',
            },
        ],
        type: 'object',
        required: [
            'account_tenant_id',
            'container_name',
            'storage_account_name',
        ],
        properties: {
            account_tenant_id: {
                description:
                    "The tenant ID that owns the storage account that we're writing into NOTE: This is not the tenant ID that owns the service principal",
                type: 'string',
            },
            container_name: {
                description:
                    'In azure, blobs are stored inside of containers, which live inside accounts',
                type: 'string',
            },
            storage_account_name: {
                description:
                    'Storage accounts in Azure are the equivalent to a "bucket" in S3',
                type: 'string',
            },
            prefix: {
                description: 'Optional prefix of keys written to the bucket.',
                type: 'string',
                pattern: '^([\\p{Letter}\\p{Number}\\-_\\.]+/)*$',
            },
        },
    },
    [CloudProviderCodes.CUSTOM]: {
        title: 'An S3-compatible endpoint',
        description:
            'Details of an s3-compatible storage endpoint, such as Minio or R2.',
        examples: [
            {
                bucket: 'my-bucket',
                endpoint: 'storage.example.com',
            },
        ],
        type: 'object',
        required: ['bucket', 'endpoint'],
        properties: {
            bucket: {
                description: 'Bucket into which Flow will store data.',
                type: 'string',
                pattern: '(^[a-z0-9][a-z0-9\\-_\\.]{1,60}[a-z0-9]$)',
            },
            endpoint: {
                description:
                    'The address of an S3-compatible storage provider.',
                type: 'string',
                pattern:
                    '^^(http://|https://)?[a-z0-9]+[a-z0-9\\.:-]*[a-z0-9]+$',
            },
            prefix: {
                description: 'Optional prefix of keys written to the bucket.',
                type: 'string',
                pattern: '^([\\p{Letter}\\p{Number}\\-_\\.]+/)*$',
            },
        },
    },
    [CloudProviderCodes.GCS]: {
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
                pattern: '^([\\p{Letter}\\p{Number}\\-_\\.]+/)*$',
            },
        },
    },
    [CloudProviderCodes.S3]: {
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
                pattern: '^([\\p{Letter}\\p{Number}\\-_\\.]+/)*$',
            },
        },
    },
};

function StorageMappingForm() {
    const formValue = useStorageMappingStore((state) => state.formValue);
    const updateFormValue = useStorageMappingStore(
        (state) => state.updateFormValue
    );

    const provider = useStorageMappingStore((state) => state.provider);

    const schema = useMemo(
        () =>
            Object.hasOwn(providerSchemas, provider)
                ? providerSchemas[provider]
                : {},
        [provider]
    );

    const uiSchema = useMemo(
        () => custom_generateDefaultUISchema(schema),
        [schema]
    );

    return Boolean(provider && !isEmpty(schema)) ? (
        <StyledEngineProvider injectFirst>
            <Stack sx={{ ...jsonFormsPadding }}>
                <JsonForms
                    {...jsonFormsDefaults}
                    schema={schema}
                    uischema={uiSchema}
                    data={formValue.data}
                    onChange={(value) => {
                        updateFormValue(value);
                    }}
                />
            </Stack>
        </StyledEngineProvider>
    ) : null;
}

export default StorageMappingForm;
