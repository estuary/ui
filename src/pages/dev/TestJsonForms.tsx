import { JsonSchema } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import {
    Alert,
    Box,
    Button,
    Divider,
    Stack,
    StyledEngineProvider,
    TextField,
} from '@mui/material';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import PageContainer from 'components/shared/PageContainer';
import { jsonFormsPadding } from 'context/Theme';
import { useState } from 'react';
import { setDefaultsValidator } from 'services/ajv';
import { defaultOptions, defaultRenderers } from 'services/jsonforms';

const TestJsonForms = () => {
    const [error, setError] = useState<string | null>(null);
    const [schemaInput, setSchemaInput] = useState('');
    const [schema, setSchema] = useState<JsonSchema | null>(null);

    const parseSchema = () => {
        try {
            setSchema(null);
            const parsedSchema = JSON.parse(schemaInput);
            setSchema(parsedSchema);
        } catch {
            setError(
                'Failed to parse input. Make sure it is valid JSON and then click button again'
            );
        }
    };

    return (
        <PageContainer>
            <Stack
                spacing={2}
                sx={{
                    justifyContent: 'center',
                }}
            >
                {error !== null && <Alert severity="error">{error}</Alert>}

                <TextField
                    value={schemaInput}
                    multiline
                    minRows={3}
                    onChange={(event) => setSchemaInput(event.target.value)}
                />

                <Button onClick={parseSchema}>Render</Button>

                <Divider flexItem>Form will render below this line</Divider>
            </Stack>
            <WrapperWithHeader header={<>Fake Form Header</>}>
                {schema !== null ? (
                    <StyledEngineProvider injectFirst>
                        <Box
                            sx={{
                                ...jsonFormsPadding,
                            }}
                        >
                            <JsonForms
                                schema={schema}
                                data={{}}
                                renderers={defaultRenderers}
                                cells={materialCells}
                                config={defaultOptions}
                                validationMode="ValidateAndShow"
                                onChange={(state) =>
                                    console.log(
                                        'This is the new state of the form',
                                        state
                                    )
                                }
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
