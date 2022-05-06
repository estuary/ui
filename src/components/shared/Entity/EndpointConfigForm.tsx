import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import useEntityStore, {
    fooSelectors,
    FormStatus,
} from 'components/shared/Entity/Store';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';

type Props = {
    endpointSchema: any;
};

export const setDefaultsValidator = createAjv({
    // Causes it to mutate its input to set default values.
    useDefaults: true,
    // Don't barf when things aren't quite aligned with the JSON schema spec. Log it instead.
    strict: 'log',
    // Skip validation of the schema itself, because many connector schemas won't validate.
    // Normally, we'd want to just fix the schemas, but this allows the validator to deal with
    // draft-4 schemas, which normally requires using a separate legacy validator.
    validateSchema: false,
    // Disable validations based on `format` keywords in the schema. Ideally, we'd re-enable this at
    // some point, but there's a few problems with it. One is that many schemas seem to mis-use the
    // `date-time` format to mean ISO8601 instead of RFC3339. Another is that some schemas seem to
    // use made-up format strings that we won't recognize.
    validateFormats: false,
});

export function createJSONFormDefaults(jsonSchema: any): Object {
    // We start with an empty object, and then validate it to set any default values.
    // Note that this requires all parent properties to also specify a `default` in the json
    // schema.
    const defaultValues = {};
    setJSONFormDefaults(jsonSchema, defaultValues);
    return defaultValues;
}

function setJSONFormDefaults(jsonSchema: any, formData: any) {
    const hydrateAndValidate = setDefaultsValidator.compile(jsonSchema);
    hydrateAndValidate(formData);
}

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
