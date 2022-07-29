import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import {
    DetailsFormStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { useEffect, useRef } from 'react';
import { setDefaultsValidator } from 'services/ajv';
import {
    custom_generateDefaultUISchema,
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { DetailsFormState } from 'stores/MiniCreate';
import { ResourceConfigState } from 'stores/ResourceConfig';

type Props = {
    collectionName: string;
    resourceConfigStoreName: ResourceConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
};

function ResourceConfigForm({
    collectionName,
    resourceConfigStoreName,
    detailsFormStoreName,
}: Props) {
    const name = useRef(collectionName);

    const setConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(resourceConfigStoreName, (state) => state.setResourceConfig);

    const resourceConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(resourceConfigStoreName, (state) => state.resourceConfig);

    const formData = resourceConfig[collectionName].data;

    const displayValidation = useZustandStore<
        DetailsFormState,
        DetailsFormState['formState']['displayValidation']
    >(detailsFormStoreName, (state) => state.formState.displayValidation);

    const isActive = useZustandStore<
        DetailsFormState,
        DetailsFormState['isActive']
    >(detailsFormStoreName, (state) => state.isActive);

    const resourceSchema = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceSchema']
    >(resourceConfigStoreName, (state) => state.resourceSchema);

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
