import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { createJSONFormDefaults, setDefaultsValidator } from 'services/ajv';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
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

    useEffect(() => {
        setSpec({
            data: createJSONFormDefaults(endpointSchema),
        });
    }, [endpointSchema, setSpec]);

    const uiSchema = generateCustomUISchema(endpointSchema);
    const showValidationVal = showValidation(displayValidation);
    const handlers = {
        onChange: (form: any) => {
            if (!isEmpty(form.data)) {
                setSpec(form);
            }
        },
    };

    return (
        <StyledEngineProvider injectFirst>
            <div id={CONFIG_EDITOR_ID}>
                <JsonForms
                    schema={endpointSchema}
                    uischema={uiSchema}
                    data={formData}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    readonly={formStateStatus !== FormStatus.IDLE}
                    validationMode={showValidationVal}
                    onChange={handlers.onChange}
                    ajv={setDefaultsValidator}
                />
            </div>
        </StyledEngineProvider>
    );
}

export default EndpointConfigForm;
