import { JsonForms } from '@jsonforms/react';
import { Stack, StyledEngineProvider } from '@mui/material';
import { jsonFormsPadding } from 'context/Theme';
import { Dispatch, SetStateAction } from 'react';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { jsonFormsDefaults } from 'services/jsonforms/defaults';
import { JsonFormsData } from 'types';

interface Props {
    formData: JsonFormsData;
    setFormData: Dispatch<SetStateAction<JsonFormsData>>;
}

const schema = {
    title: 'Amazon Simple Storage Service.',
    examples: [
        {
            bucket: 'my-bucket',
            // prefix: null,
            region: null,
        },
    ],
    type: 'object',
    required: ['bucket', 'provider'],
    properties: {
        // prefix: {
        //     description: 'Prefix of keys written to the bucket.',
        //     default: null,
        //     examples: ['acmeCo/widgets/'],
        //     type: 'string',
        //     pattern: '^([\\p{Letter}\\p{Number}\\-_\\.]+/)*$',
        // },
        provider: {
            type: 'string',
            enum: ['S3'],
        },
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

function StorageMappingsForm({ formData, setFormData }: Props) {
    const uiSchema = custom_generateDefaultUISchema(schema);

    return (
        <StyledEngineProvider injectFirst>
            <Stack sx={{ ...jsonFormsPadding }}>
                <JsonForms
                    {...jsonFormsDefaults}
                    schema={schema}
                    uischema={uiSchema}
                    data={formData.data}
                    onChange={(value) => {
                        setFormData(value);
                    }}
                />
            </Stack>
        </StyledEngineProvider>
    );
}

export default StorageMappingsForm;
