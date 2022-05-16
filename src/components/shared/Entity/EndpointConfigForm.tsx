import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, StyledEngineProvider } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { createJSONFormDefaults, setDefaultsValidator } from 'services/ajv';
import {
    custom_generateDefaultUISchema,
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { createStoreSelectors, FormStatus } from 'stores/Create';
import { getStore } from 'stores/Repo';

type Props = {
    endpointSchema: any;
};

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

function EndpointConfigForm({ endpointSchema }: Props) {
    const entityCreateStore = getStore(useRouteStore());
    const setSpec = entityCreateStore(createStoreSelectors.endpointConfig.set);
    const formData = entityCreateStore(
        createStoreSelectors.endpointConfig.data
    );
    const displayValidation = entityCreateStore(
        createStoreSelectors.formState.displayValidation
    );
    const formStateStatus = entityCreateStore(
        createStoreSelectors.formState.status
    );
    const setEndpointSchema = entityCreateStore(
        createStoreSelectors.setEndpointSchema
    );

    useEffect(() => {
        setEndpointSchema(endpointSchema);
        setSpec({
            data: createJSONFormDefaults(endpointSchema),
            errors: [],
        });
    }, [endpointSchema, setEndpointSchema, setSpec]);

    const uiSchema = custom_generateDefaultUISchema(endpointSchema);
    // To help debug form rendering
    console.log(
        'Input JSON Schema:',
        endpointSchema,
        'Output UI Schema:',
        uiSchema
    );
    const showValidationVal = showValidation(displayValidation);

    return (
        <StyledEngineProvider injectFirst>
            <div id={CONFIG_EDITOR_ID}>
                <Box
                    sx={{
                        '& .MuiGrid-root': {
                            '& .MuiGrid-root': {
                                'disply': 'flex',
                                'flex': '1 1 0',
                                'flexDirection': 'row',
                                '& .MuiGrid-grid-xs-true': {
                                    border: '1px solid #00ff00',
                                    minWidth: 300,
                                    padding: '0',
                                    margin: 1,
                                },
                            },
                        },
                    }}
                >
                    <JsonForms
                        schema={endpointSchema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={formStateStatus !== FormStatus.IDLE}
                        validationMode={showValidationVal}
                        onChange={setSpec}
                        ajv={setDefaultsValidator}
                    />
                </Box>
            </div>
        </StyledEngineProvider>
    );
}

export default EndpointConfigForm;
