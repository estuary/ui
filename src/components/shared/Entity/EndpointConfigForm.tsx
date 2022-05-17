import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, StyledEngineProvider } from '@mui/material';
import { jsonFormsPadding } from 'context/Theme';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { createJSONFormDefaults, setDefaultsValidator } from 'services/ajv';
import {
    custom_generateDefaultUISchema,
    defaultOptions,
    defaultRenderers,
    generateCategoryUiSchema,
    showValidation,
} from 'services/jsonforms';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';
import useConstant from 'use-constant';

type Props = {
    endpointSchema: any;
};

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

function EndpointConfigForm({ endpointSchema }: Props) {
    const entityCreateStore = useRouteStore();
    const setSpec = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.set
    );
    const formData = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const displayValidation = entityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );
    const formStateStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const setEndpointSchema = entityCreateStore(
        entityCreateStoreSelectors.setEndpointSchema
    );

    useEffect(() => {
        setEndpointSchema(endpointSchema);
        setSpec({
            data: createJSONFormDefaults(endpointSchema),
            errors: [],
        });
    }, [endpointSchema, setEndpointSchema, setSpec]);

    const categoryLikeSchema = useConstant(() =>
        generateCategoryUiSchema(custom_generateDefaultUISchema(endpointSchema))
    );

    console.log('Schema generated for the endpoint config form', {
        input: endpointSchema,
        output: categoryLikeSchema,
    });

    const showValidationVal = showValidation(displayValidation);

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
                    readonly={
                        formStateStatus === FormStatus.TESTING ||
                        formStateStatus === FormStatus.SAVING
                    }
                    validationMode={showValidationVal}
                    onChange={setSpec}
                    ajv={setDefaultsValidator}
                />
            </Box>
        </StyledEngineProvider>
    );
}

export default EndpointConfigForm;
