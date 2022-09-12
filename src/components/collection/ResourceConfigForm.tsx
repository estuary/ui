import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { ResourceConfigStoreNames, useZustandStore } from 'context/Zustand';
import { useEffect, useRef } from 'react';
import { setDefaultsValidator } from 'services/ajv';
import {
    custom_generateDefaultUISchema,
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import {
    useFormStateStore_displayValidation,
    useFormStateStore_isActive,
} from 'stores/FormState';
import {
    ResourceConfigState,
    useResourceConfig_resourceConfig,
} from 'stores/ResourceConfig';

type Props = {
    collectionName: string;
    resourceConfigStoreName: ResourceConfigStoreNames;
    readOnly?: boolean;
};

function ResourceConfigForm({
    collectionName,
    resourceConfigStoreName,
    readOnly = false,
}: Props) {
    const name = useRef(collectionName);

    // Resource Config Store
    const setConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(resourceConfigStoreName, (state) => state.setResourceConfig);

    const resourceConfig = useResourceConfig_resourceConfig();

    const formData = resourceConfig[collectionName].data;

    const resourceSchema = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceSchema']
    >(resourceConfigStoreName, (state) => state.resourceSchema);

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();

    const isActive = useFormStateStore_isActive();

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
                readonly={readOnly || isActive}
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
