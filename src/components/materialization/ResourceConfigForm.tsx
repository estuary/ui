import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { createJSONFormDefaults, setDefaultsValidator } from 'services/ajv';
import {
    custom_generateDefaultUISchema,
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

type Props = {
    resourceSchema: any;
    collectionName: string;
};

function NewMaterializationResourceConfigForm({
    resourceSchema,
    collectionName,
}: Props) {
    const entityCreateStore = useRouteStore();

    const setConfig = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.set
    );
    const formData = entityCreateStore(
        (state: any) => state.resourceConfig[collectionName].data
    );
    const displayValidation = entityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );
    const status = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );

    // Resolve Refs & Hydrate the object
    //  This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        setConfig(collectionName, {
            data: createJSONFormDefaults(resourceSchema),
        });
    }, [collectionName, resourceSchema, setConfig]);

    const uiSchema = custom_generateDefaultUISchema(resourceSchema);
    const showValidationVal = showValidation(displayValidation);

    const handlers = {
        onChange: (form: any) => {
            setConfig(collectionName, form);
        },
    };

    return (
        <StyledEngineProvider injectFirst>
            <JsonForms
                schema={resourceSchema}
                uischema={uiSchema}
                data={formData}
                renderers={defaultRenderers}
                cells={materialCells}
                config={defaultOptions}
                readonly={
                    status === FormStatus.TESTING ||
                    status === FormStatus.SAVING
                }
                validationMode={showValidationVal}
                onChange={handlers.onChange}
                ajv={setDefaultsValidator}
            />
        </StyledEngineProvider>
    );
}

export default NewMaterializationResourceConfigForm;
