import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect, useRef } from 'react';
import { setDefaultsValidator } from 'services/ajv';
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

    useEffect(() => {
        name.current = collectionName;
    }, [collectionName]);

    const uiSchema = custom_generateDefaultUISchema(resourceSchema);
    const showValidationVal = showValidation(displayValidation);

    const handlers = {
        onChange: (configName: string, form: any) => {
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
