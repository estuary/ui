import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, StyledEngineProvider } from '@mui/material';
import { jsonFormsPadding } from 'context/Theme';
import {
    EndpointConfigStoreNames,
    FormStateStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { isEmpty } from 'lodash';
import { useEffect, useMemo } from 'react';
import { createJSONFormDefaults, setDefaultsValidator } from 'services/ajv';
import {
    custom_generateDefaultUISchema,
    defaultOptions,
    defaultRenderers,
    generateCategoryUiSchema,
    showValidation,
} from 'services/jsonforms';
import { EndpointConfigState } from 'stores/EndpointConfig';
import { EntityFormState } from 'stores/FormState';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

interface Props {
    endpointConfigStoreName: EndpointConfigStoreNames;
    formStateStoreName: FormStateStoreNames;
}

function EndpointConfigForm({
    endpointConfigStoreName,
    formStateStoreName,
}: Props) {
    // Endpoint Config Store
    const setSpec = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointConfig']
    >(endpointConfigStoreName, (state) => state.setEndpointConfig);

    const formData = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfig']['data']
    >(endpointConfigStoreName, (state) => state.endpointConfig.data);

    const endpointSchema = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointSchema']
    >(endpointConfigStoreName, (state) => state.endpointSchema);

    // Form State Store
    const displayValidation = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['displayValidation']
    >(formStateStoreName, (state) => state.formState.displayValidation);

    const isActive = useZustandStore<
        EntityFormState,
        EntityFormState['isActive']
    >(formStateStoreName, (state) => state.isActive);

    useEffect(() => {
        if (!isEmpty(endpointSchema)) {
            setSpec(createJSONFormDefaults(endpointSchema));
        }
    }, [endpointSchema, setSpec]);

    const categoryLikeSchema = useMemo(() => {
        if (!isEmpty(endpointSchema)) {
            const generatedSchema = generateCategoryUiSchema(
                custom_generateDefaultUISchema(endpointSchema)
            );

            return generatedSchema;
        } else {
            return null;
        }
    }, [endpointSchema]);

    const showValidationVal = showValidation(displayValidation);

    if (categoryLikeSchema === null) {
        return null;
    }

    return (
        <StyledEngineProvider injectFirst>
            <Box
                id={CONFIG_EDITOR_ID}
                sx={{
                    ...jsonFormsPadding,
                }}
            >
                <JsonForms
                    schema={endpointSchema}
                    uischema={categoryLikeSchema}
                    data={formData}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    readonly={isActive}
                    validationMode={showValidationVal}
                    onChange={setSpec}
                    ajv={setDefaultsValidator}
                />
            </Box>
        </StyledEngineProvider>
    );
}

export default EndpointConfigForm;
