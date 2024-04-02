import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { useState } from 'react';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { jsonFormsDefaults } from 'services/jsonforms/defaults';
import { JsonFormsData } from 'types';

const sampleSchema = {
    $schema: 'http://json-schema.org/draft/2020-12/schema',
    properties: {
        provider: {
            type: 'string',
            title: 'Provider',
            description: 'Cloud provider in which the desired bucket lives.',
        },
        bucket: {
            type: 'string',
            title: 'Bucket',
            description: 'Name of the bucket to write data to.',
        },
        prefix: {
            type: 'string',
            title: 'Prefix',
            description: 'The top-level prefix of the data to write',
        },
    },
    type: 'object',
    required: ['provider', 'bucket', 'prefix'],
    title: 'Storage Mapping',
};

function StorageMappingsForm() {
    const [formData, setFormData] = useState<JsonFormsData>({
        data: {},
    });

    const uiSchema = custom_generateDefaultUISchema(sampleSchema);

    return (
        <StyledEngineProvider injectFirst>
            <JsonForms
                {...jsonFormsDefaults}
                schema={sampleSchema}
                uischema={uiSchema}
                data={formData.data}
                onChange={(value) => {
                    setFormData(value);
                }}
            />
        </StyledEngineProvider>
    );
}

export default StorageMappingsForm;
