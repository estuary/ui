import { JsonSchema } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import Editor from '@monaco-editor/react';
import {
    Box,
    Button,
    Divider,
    Stack,
    StyledEngineProvider,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import PageContainer from 'components/shared/PageContainer';
import { jsonFormsPadding } from 'context/Theme';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useConnectors from 'hooks/useConnectors';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { setDefaultsValidator } from 'services/ajv';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions } from 'services/jsonforms/shared';
import { DetailsFormHydrator } from 'stores/DetailsForm/Hydrator';

const TestJsonForms = () => {
    const intl = useIntl();
    const { connectors } = useConnectors();
    const [error, setError] = useState<string | null>(null);
    const [schemaInput, setSchemaInput] = useState<string | undefined>('');
    const [schema, setSchema] = useState<JsonSchema | null>(null);
    const [uiSchema, setUiSchema] = useState<any | null>(null);
    const [formData, setFormData] = useState({});

    const connectorsOneOf = useMemo(() => {
        const response = [] as { title: string; const: Object }[];

        if (connectors.length > 0) {
            connectors.forEach((connector) => {
                response.push({
                    const: { id: connector.id },
                    title: connector.title['en-US'],
                });
            });
        }

        return response;
    }, [connectors]);

    const topSchema = useMemo(() => {
        return {
            properties: {
                [CONNECTOR_IMAGE_SCOPE]: {
                    description: intl.formatMessage({
                        id: 'connector.description',
                    }),
                    oneOf: connectorsOneOf,
                    type: 'object',
                },
            },
            required: [CONNECTOR_IMAGE_SCOPE],
            type: 'object',
        };
    }, [connectorsOneOf, intl]);
    console.log(connectorsOneOf);

    const topUiSchema = {
        elements: [
            {
                elements: [
                    {
                        label: intl.formatMessage({
                            id: 'entityCreate.connector.label',
                        }),
                        scope: `#/properties/${CONNECTOR_IMAGE_SCOPE}`,
                        type: 'Control',
                    },
                ],
                type: 'HorizontalLayout',
            },
        ],
        type: 'VerticalLayout',
    };

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

            const generatedSchema =
                custom_generateDefaultUISchema(parsedSchema);

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
        <PageContainer>
            <Stack
                spacing={2}
                sx={{
                    justifyContent: 'center',
                }}
            >
                {error !== null ? (
                    <AlertBox severity="error">{error}</AlertBox>
                ) : null}

                <JsonForms
                    schema={topSchema}
                    uischema={topUiSchema}
                    data={{}}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    validationMode="ValidateAndShow"
                    onChange={(state) => {
                        console.log('This is the new state of the form', state);
                        const searchParams = new URLSearchParams(
                            window.location.search
                        );
                        searchParams.set(
                            GlobalSearchParams.CONNECTOR_ID,
                            state.data.connectorImage.id
                        );
                        window.location.search = searchParams.toString();
                    }}
                    ajv={setDefaultsValidator}
                />

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
                <StyledEngineProvider injectFirst>
                    <Box
                        sx={{
                            ...jsonFormsPadding,
                        }}
                    >
                        <DetailsFormHydrator>
                            {schema !== null && uiSchema !== null ? (
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
                            ) : (
                                <>
                                    To render form enter a schema above and
                                    click the Render button
                                </>
                            )}
                        </DetailsFormHydrator>
                    </Box>
                </StyledEngineProvider>
            </WrapperWithHeader>
        </PageContainer>
    );
};

export default TestJsonForms;
