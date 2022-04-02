import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/create/Store';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';

type NewCaptureSpecFormProps = {
    displayValidation: boolean;
    readonly: boolean;
    endpointSchema: any;
};

const defaultAjv = createAjv({ useDefaults: true });

const stateSelectors = {
    formData: (state: CaptureCreationState) => state.spec.data,
    setSpec: (state: CaptureCreationState) => state.setSpec,
};
function NewCaptureSpecForm(props: NewCaptureSpecFormProps) {
    const { readonly, displayValidation, endpointSchema } = props;

    const setSpec = useCaptureCreationStore(stateSelectors.setSpec);
    const formData = useCaptureCreationStore(stateSelectors.formData);

    // This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        const hydrateAndValidate = defaultAjv.compile(endpointSchema);
        const defaultValues = {};
        hydrateAndValidate(defaultValues);

        setSpec({
            data: defaultValues,
        });
    }, [endpointSchema, setSpec]);

    if (endpointSchema.type) {
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
                    readonly={readonly}
                    validationMode={showValidationVal}
                    onChange={handlers.onChange}
                />
            </StyledEngineProvider>
        );
    } else {
        return null;
    }
}

export default NewCaptureSpecForm;
