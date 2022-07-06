import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, StyledEngineProvider } from '@mui/material';
import { jsonFormsPadding } from 'context/Theme';
import { useRouteStore } from 'hooks/useRouteStore';
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
import { entityCreateStoreSelectors } from 'stores/Create';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

function EndpointConfigForm() {
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
    const endpointSchema = useEntityCreateStore(
        entityCreateStoreSelectors.endpointSchema
    );
    const isActive = useEntityCreateStore(entityCreateStoreSelectors.isActive);

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
