import { JsonForms } from '@jsonforms/react';
import { Stack, StyledEngineProvider } from '@mui/material';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import { jsonFormsPadding } from 'context/Theme';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { jsonFormsDefaults } from 'services/jsonforms/defaults';

const schema = {
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
    },
};

function StorageMappingForm() {
    const formValue = useStorageMappingStore((state) => state.formValue);
    const updateFormValue = useStorageMappingStore(
        (state) => state.updateFormValue
    );

    const uiSchema = custom_generateDefaultUISchema(schema);

    return (
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
    );
}

export default StorageMappingForm;
