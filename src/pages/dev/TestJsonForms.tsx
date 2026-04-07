import type { SelectChangeEvent } from '@mui/material';

import { useState } from 'react';

import {
    Box,
    Button,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    StyledEngineProvider,
} from '@mui/material';

import { JsonForms } from '@jsonforms/react';

import Editor from '@monaco-editor/react';
import { useUnmount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import PageContainer from 'src/components/shared/PageContainer';
import { jsonFormsPadding } from 'src/context/Theme';
import { WorkflowContextProvider } from 'src/context/Workflow';
import useConnectors from 'src/hooks/connectors/useConnectors';
import {
    custom_generateDefaultUISchema,
    getDereffedSchema,
} from 'src/services/jsonforms';
import { jsonFormsDefaults } from 'src/services/jsonforms/defaults';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';

const TestJsonForms = () => {
    const { connectors } = useConnectors();
    const [connectorId, setConnectorId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [schemaInput, setSchemaInput] = useState<string | undefined>('');
    const [schema, setSchema] = useState<any | null>(null);
    const [uiSchema, setUiSchema] = useState<any | null>(null);
    const [formData, setFormData] = useState({});

    const setDetails_connector = useDetailsFormStore(
        (state) => state.setDetails_connector
    );
    const setHydrated = useDetailsFormStore((state) => state.setHydrated);
    const resetDetailsForm = useDetailsFormStore((state) => state.resetState);

    const applyConnectorId = (id: string) => {
        setConnectorId(id);
        setDetails_connector({
            id,
            iconPath: '',
            imageName: '',
            imagePath: '',
            imageTag: '',
            connectorId: id,
        });
        setHydrated(true);
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

                    <AlertBox severity="info" short title="Instructions">
                        <Box>
                            1. TESTING OAUTH - Select a connector in the
                            dropdown. This will be the connector that is looked
                            up in the DB for the <code>authURL</code> and{' '}
                            <code>accessToken</code>.
                        </Box>
                        <Box>
                            2. Paste a JSONSchema into the text area below and
                            clicked on render to see the form.
                        </Box>
                        <Box>
                            3. Open the browser console to see details related
                            to the state, schema, and ui schema.
                        </Box>
                        <Box>
                            Due to how the UI manages things during edit. The
                            oAuth &quot;Authenticated&quot; chip will always
                            show as authenticated.
                        </Box>
                    </AlertBox>

                    <FormControl fullWidth>
                        <InputLabel>Connector</InputLabel>
                        <Select
                            label="Connector"
                            value={connectorId}
                            onChange={(e: SelectChangeEvent) => {
                                applyConnectorId(e.target.value);
                            }}
                        >
                            {connectors.map((connector) => (
                                <MenuItem
                                    key={connector.id}
                                    value={connector.id}
                                >
                                    {connector.title['en-US']} ({connector.id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

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
                            {schema !== null && uiSchema !== null ? (
                                <JsonForms
                                    {...jsonFormsDefaults}
                                    schema={schema}
                                    uischema={uiSchema}
                                    data={formData}
                                    validationMode="ValidateAndShow"
                                    onChange={(state) => {
                                        console.log(
                                            'This is the new state of the form',
                                            state
                                        );
                                    }}
                                />
                            ) : (
                                <>
                                    To render form enter a schema above and
                                    click the Render button
                                </>
                            )}
                        </Box>
                    </StyledEngineProvider>
                </WrapperWithHeader>
            </WorkflowContextProvider>
        </PageContainer>
    );
};

export default TestJsonForms;
