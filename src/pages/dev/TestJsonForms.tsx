import { useMemo, useState } from 'react';

import {
    Box,
    Button,
    Divider,
    Stack,
    StyledEngineProvider,
} from '@mui/material';

import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';

import Editor from '@monaco-editor/react';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import PageContainer from 'src/components/shared/PageContainer';
import { jsonFormsPadding } from 'src/context/Theme';
import { WorkflowContextProvider } from 'src/context/Workflow';
import { CONNECTOR_IMAGE_SCOPE } from 'src/forms/renderers/Connectors';
import useConnectors from 'src/hooks/connectors/useConnectors';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { customAjv } from 'src/services/ajv';
import { custom_generateDefaultUISchema } from 'src/services/jsonforms';
import defaultRenderers from 'src/services/jsonforms/defaultRenderers';
import { defaultOptions } from 'src/services/jsonforms/shared';
import { DetailsFormHydrator } from 'src/stores/DetailsForm/Hydrator';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { getDereffedSchema } from 'src/utils/misc-utils';

const TestJsonForms = () => {
    const intl = useIntl();
    const { connectors } = useConnectors();
    const [error, setError] = useState<string | null>(null);
    const [schemaInput, setSchemaInput] = useState<string | undefined>('');
    const [schema, setSchema] = useState<any | null>(null);
    const [uiSchema, setUiSchema] = useState<any | null>(null);
    const [formData, setFormData] = useState({});

    const resetDetailsForm = useDetailsFormStore((state) => state.resetState);

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

    const parseSchema = async () => {
        if (!schemaInput) {
            failed();
            return;
        }

        try {
            setFormData({});
            setSchema(null);
            const parsedSchema = JSON.parse(schemaInput);

            const resolved = await getDereffedSchema(parsedSchema);

            if (!resolved) {
                throw new Error('failed to deref schema');
            }

            setSchema(resolved);

            const generatedSchema = custom_generateDefaultUISchema(resolved);
            setUiSchema(generatedSchema);

            console.log('Generated this UI Schema:', {
                parsed: parsedSchema,
                in: resolved,
                out: generatedSchema,
            });
        } catch {
            failed();
        }
    };

    const searchParams = new URLSearchParams(window.location.search);

    useUnmount(() => {
        resetDetailsForm();
    });

    return (
        <PageContainer>
            <WorkflowContextProvider value="test_json_forms">
                <Stack
                    spacing={2}
                    sx={{
                        justifyContent: 'center',
                    }}
                >
                    {error !== null ? (
                        <AlertBox short={false} severity="error">
                            {error}
                        </AlertBox>
                    ) : null}

                    <JsonForms
                        schema={topSchema}
                        uischema={topUiSchema}
                        data={{
                            connectorImage: {
                                id: searchParams.get(
                                    GlobalSearchParams.CONNECTOR_ID
                                ),
                            },
                        }}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        validationMode="ValidateAndShow"
                        onChange={(state) => {
                            console.log(
                                'This is the new state of the form',
                                state
                            );
                            const connectorId = state.data?.connectorImage?.id;
                            if (
                                connectorId &&
                                searchParams.get(
                                    GlobalSearchParams.CONNECTOR_ID
                                ) !== connectorId
                            ) {
                                searchParams.set(
                                    GlobalSearchParams.CONNECTOR_ID,
                                    connectorId
                                );
                                window.location.search =
                                    searchParams.toString();
                            }
                        }}
                        ajv={customAjv}
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
                                        ajv={customAjv}
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
            </WorkflowContextProvider>
        </PageContainer>
    );
};

export default TestJsonForms;
