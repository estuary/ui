import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import useFooStore, {
    fooSelectors,
    FormStatus,
} from 'components/shared/foo/Store';
import JsonRefs from 'json-refs';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';

type Props = {
    endpointSchema: any;
};

const defaultAjv = createAjv({ useDefaults: true });

function EndpointConfigForm({ endpointSchema }: Props) {
    const setSpec = useFooStore(fooSelectors.setSpec);
    const formData = useFooStore(fooSelectors.specFormData);
    const displayValidation = useFooStore(fooSelectors.displayValidation);
    const formStateStatus = useFooStore(fooSelectors.formStateStatus);

    const [dereffedSchema, setDereffedSchema] = useState<any | null>(null);

    // Resolve Refs & Hydrate the object
    //  This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        async function resolveSchemaRefs(endpointResponse: any) {
            const processedSchema = await JsonRefs.resolveRefs(
                endpointResponse
            );
            const hydrateAndValidate = defaultAjv.compile(
                processedSchema.resolved
            );
            const defaultValues = {};
            hydrateAndValidate(defaultValues);

            setDereffedSchema(processedSchema.resolved);
            setSpec({
                data: defaultValues,
            });
        }

        void resolveSchemaRefs(endpointSchema);
    }, [endpointSchema, setSpec, setDereffedSchema]);

    if (dereffedSchema) {
        const uiSchema = generateCustomUISchema(dereffedSchema);
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
                    schema={dereffedSchema}
                    uischema={uiSchema}
                    data={formData}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    readonly={formStateStatus !== FormStatus.IDLE}
                    validationMode={showValidationVal}
                    onChange={handlers.onChange}
                />
            </StyledEngineProvider>
        );
    } else {
        return null;
    }
}

export default EndpointConfigForm;
