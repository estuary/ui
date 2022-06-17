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
import { entityCreateStoreSelectors } from 'stores/Create';
import useConstant from 'use-constant';

type Props = {
    endpointSchema: any;
};

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

function EndpointConfigForm({ endpointSchema }: Props) {
    const useEntityCreateStore = useRouteStore();
    const setSpec = useEntityCreateStore(
        entityCreateStoreSelectors.endpointConfig.set
    );
    const formData = useEntityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const displayValidation = useEntityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );
    const setEndpointSchema = useEntityCreateStore(
        entityCreateStoreSelectors.setEndpointSchema
    );
    const isActive = useEntityCreateStore(entityCreateStoreSelectors.isActive);

    useEffect(() => {
        setEndpointSchema(endpointSchema);
        setSpec({
            data: createJSONFormDefaults(endpointSchema),
            errors: [],
        });
    }, [endpointSchema, setEndpointSchema, setSpec]);

    const categoryLikeSchema = useConstant(() => {
        const generatedSchema = generateCategoryUiSchema(
            custom_generateDefaultUISchema(endpointSchema)
        );

        // Uncomment for logging if you need to debug creating a schema
        // console.log('Schema generated for the endpoint config form', {
        //     input: endpointSchema,
        //     output: generatedSchema,
        // });

        return generatedSchema;
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
