import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import useEntityStore, {
    fooSelectors,
    FormStatus,
} from 'components/shared/Entity/Store';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { createJSONFormDefaults, setDefaultsValidator } from 'services/ajv';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';

type Props = {
    endpointSchema: any;
};

function EndpointConfigForm({ endpointSchema }: Props) {
    const setSpec = useEntityStore(fooSelectors.setEndpointConfig);
    const formData = useEntityStore(fooSelectors.endpointConfig);
    const displayValidation = useEntityStore(fooSelectors.displayValidation);
    const formStateStatus = useEntityStore(fooSelectors.formStateStatus);

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
        </StyledEngineProvider>
    );
}

export default EndpointConfigForm;
