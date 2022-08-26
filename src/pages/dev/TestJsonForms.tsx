import { JsonSchema } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import Editor from '@monaco-editor/react';
import {
    Alert,
    Box,
    Button,
    Divider,
    Stack,
    StyledEngineProvider,
} from '@mui/material';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import PageContainer from 'components/shared/PageContainer';
import { jsonFormsPadding } from 'context/Theme';
import { useState } from 'react';
import { setDefaultsValidator } from 'services/ajv';
import {
    custom_generateDefaultUISchema,
    defaultOptions,
    defaultRenderers,
    generateCategoryUiSchema,
} from 'services/jsonforms';

const TITLE = 'Test JSON Forms';

const TestJsonForms = () => {
    const [error, setError] = useState<string | null>(null);
    const [schemaInput, setSchemaInput] = useState<string | undefined>('');
    const [schema, setSchema] = useState<JsonSchema | null>(null);
    const [uiSchema, setUiSchema] = useState<any | null>(null);
    const [formData, setFormData] = useState({});

    const failed = () =>
        setError(
            'Failed to parse input. Make sure it is valid JSON and then click button again'
        );

    const parseSchema = () => {
        if (!schemaInput) {
            failed();
            return;
        }

        try {
            setFormData({});
            setSchema(null);
            const parsedSchema = JSON.parse(schemaInput);
            setSchema(parsedSchema);

            const generatedSchema = generateCategoryUiSchema(
                custom_generateDefaultUISchema(parsedSchema)
            );
            setUiSchema(generatedSchema);

            console.log('Generated this UI Schema:', {
                in: parsedSchema,
                out: generatedSchema,
            });
        } catch {
            failed();
        }
    };

    return (
        <PageContainer pageTitleProps={{ header: TITLE }}>
            <Stack
                spacing={2}
                sx={{
                    justifyContent: 'center',
                }}
            >
                {error !== null ? (
                    <Alert severity="error">{error}</Alert>
                ) : null}

                <Editor
                    height="500px"
                    defaultLanguage="json"
                    onChange={(val) => {
                        setSchemaInput(val);
                    }}
                />

                <Button onClick={parseSchema}>Render</Button>

                <Divider flexItem>Form will render below this line</Divider>
            </Stack>
            <WrapperWithHeader header={<>Fake Form Header</>}>
                {schema !== null && uiSchema !== null ? (
                    <StyledEngineProvider injectFirst>
                        <Box
                            sx={{
                                ...jsonFormsPadding,
                            }}
                        >
                            <JsonForms
                                schema={schema}
                                uischema={uiSchema}
                                data={formData}
                                renderers={defaultRenderers}
                                cells={materialCells}
                                config={defaultOptions}
                                validationMode="ValidateAndShow"
                                onChange={(state) => {
                                    console.log(
                                        'This is the new state of the form',
                                        state
                                    );
                                }}
                                ajv={setDefaultsValidator}
                            />
                        </Box>
                    </StyledEngineProvider>
                ) : (
                    <>
                        To render form enter a schema above and click the Render
                        button
                    </>
                )}
            </WrapperWithHeader>
        </PageContainer>
    );
};

export default TestJsonForms;
