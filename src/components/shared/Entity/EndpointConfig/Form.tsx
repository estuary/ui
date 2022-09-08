import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, StyledEngineProvider } from '@mui/material';
import { jsonFormsPadding } from 'context/Theme';
import { FormStateStoreNames, useZustandStore } from 'context/Zustand';
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
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_setEndpointConfig,
} from 'stores/EndpointConfig';
import { EntityFormState } from 'stores/FormState';
import { JsonFormsData } from 'types';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

interface Props {
    formStateStoreName: FormStateStoreNames;
    readOnly: boolean;
    initialEndpointConfig?: JsonFormsData | null;
}

function EndpointConfigForm({
    formStateStoreName,
    readOnly,
    initialEndpointConfig,
}: Props) {
    // Endpoint Config Store
    const setSpec = useEndpointConfigStore_setEndpointConfig();
    const formData = useEndpointConfigStore_endpointConfig_data();
    const endpointSchema = useEndpointConfigStore_endpointSchema();

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
            setSpec(
                initialEndpointConfig ?? createJSONFormDefaults(endpointSchema)
            );
        }
    }, [setSpec, endpointSchema, initialEndpointConfig]);

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
                    readonly={readOnly || isActive}
                    validationMode={showValidationVal}
                    onChange={setSpec}
                    ajv={setDefaultsValidator}
                />
            </Box>
        </StyledEngineProvider>
    );
}

export default EndpointConfigForm;
