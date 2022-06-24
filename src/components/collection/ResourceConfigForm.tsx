import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect, useRef } from 'react';
import { createJSONFormDefaults, setDefaultsValidator } from 'services/ajv';
import {
    custom_generateDefaultUISchema,
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { entityCreateStoreSelectors } from 'stores/Create';

type Props = {
    resourceSchema: any;
    collectionName: string;
};

function ResourceConfigForm({ resourceSchema, collectionName }: Props) {
    const name = useRef(collectionName);
    const useEntityCreateStore = useRouteStore();

    const collections: string[] = useEntityCreateStore(
        entityCreateStoreSelectors.collections.get
    );
    const setConfig = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.set
    );
    const formData = useEntityCreateStore(
        (state: any) => state.resourceConfig[collectionName].data
    );
    const displayValidation = useEntityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );
    const isActive = useEntityCreateStore(entityCreateStoreSelectors.isActive);

    // Resolve Refs & Hydrate the object
    //  This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        if (!collections.includes(collectionName)) {
            setConfig(collectionName, {
                data: createJSONFormDefaults(resourceSchema),
                errors: [],
            });
        }
    }, [collectionName, resourceSchema, collections, setConfig]);

    useEffect(() => {
        name.current = collectionName;
    }, [collectionName]);

    const uiSchema = custom_generateDefaultUISchema(resourceSchema);
    const showValidationVal = showValidation(displayValidation);

    const handlers = {
        onChange: (configName: string, form: any) => {
            console.log('Updating config', { configName, form });
            setConfig(configName, form);
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
                readonly={isActive}
                validationMode={showValidationVal}
                onChange={(state) => {
                    handlers.onChange(name.current, state);
                }}
                ajv={setDefaultsValidator}
            />
        </StyledEngineProvider>
    );
}

export default ResourceConfigForm;
