import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, StyledEngineProvider } from '@mui/material';
import { jsonFormsPadding } from 'context/Theme';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { setDefaultsValidator } from 'services/ajv';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_setEndpointConfig,
} from 'stores/EndpointConfig';
import {
    useFormStateStore_displayValidation,
    useFormStateStore_isActive,
} from 'stores/FormState/hooks';
import { EntityWorkflow } from 'types';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

interface Props {
    readOnly: boolean;
    workflow: EntityWorkflow | null;
}

function EndpointConfigForm({ readOnly, workflow }: Props) {
    // Endpoint Config Store
    const endpointConfig = useEndpointConfigStore_endpointConfig_data();
    const setEndpointConfig = useEndpointConfigStore_setEndpointConfig();

    const endpointSchema = useEndpointConfigStore_endpointSchema();

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();

    const isActive = useFormStateStore_isActive();

    const categoryLikeSchema = useMemo(() => {
        if (!isEmpty(endpointSchema)) {
            return custom_generateDefaultUISchema(endpointSchema);
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
                    // TODO (horizontal forms) : potential styling for making form horizontal
                    // '& .MuiAccordionDetails-root .MuiGrid-root.MuiGrid-item > .MuiFormControl-root':
                    //     {
                    //         background: 'red',
                    //         minWidth: 300,
                    //     },
                }}
            >
                <JsonForms
                    schema={endpointSchema}
                    uischema={categoryLikeSchema}
                    data={endpointConfig}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    readonly={readOnly || isActive}
                    validationMode={showValidationVal}
                    onChange={(formData) =>
                        setEndpointConfig(formData, workflow)
                    }
                    ajv={setDefaultsValidator}
                />
            </Box>
        </StyledEngineProvider>
    );
}

export default EndpointConfigForm;
