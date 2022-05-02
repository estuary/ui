import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import useMaterializationCreationStore, {
    CreationFormStatuses,
    CreationState,
} from 'components/materialization/Store';
import JsonRefs from 'json-refs';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';
import { StoreSelector } from 'types';

type Props = {
    resourceSchema: any;
};

const defaultAjv = createAjv({ useDefaults: true });

const stateSelectors: StoreSelector<CreationState> = {
    formData: (state) => state.resourceConfig.data,
    setConfig: (state) => state.setResourceConfig,
    showValidation: (state) => state.formState.showValidation,
    status: (state) => state.formState.status,
};

function NewMaterializationResourceConfigForm({ resourceSchema }: Props) {
    const setConfig = useMaterializationCreationStore(stateSelectors.setConfig);
    const formData = useMaterializationCreationStore(stateSelectors.formData);
    const displayValidation = useMaterializationCreationStore(
        stateSelectors.showValidation
    );
    const status = useMaterializationCreationStore(stateSelectors.status);

    const [deReffedSchema, setDeReffedSchema] = useState<any | null>(null);

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

            setDeReffedSchema(processedSchema.resolved);
            setConfig({
                data: defaultValues,
            });
        }

        void resolveSchemaRefs(resourceSchema);
    }, [resourceSchema, setConfig, setDeReffedSchema]);

    if (deReffedSchema) {
        const uiSchema = generateCustomUISchema(deReffedSchema);
        const showValidationVal = showValidation(displayValidation);

        const handlers = {
            onChange: (form: any) => {
                if (!isEmpty(form.data)) {
                    setConfig(form);
                }
            },
        };

        return (
            <StyledEngineProvider injectFirst>
                <JsonForms
                    schema={deReffedSchema}
                    uischema={uiSchema}
                    data={formData}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    readonly={status !== CreationFormStatuses.IDLE}
                    validationMode={showValidationVal}
                    onChange={handlers.onChange}
                />
            </StyledEngineProvider>
        );
    } else {
        return null;
    }
}

export default NewMaterializationResourceConfigForm;
