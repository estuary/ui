import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { jsonFormsDefaults } from 'services/jsonforms/defaults';
import { showValidation } from 'services/jsonforms/shared';
import {
    useFormStateStore_displayValidation,
    useFormStateStore_isActive,
} from 'stores/FormState/hooks';
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_resourceSchema,
    useResourceConfig_setResourceConfig,
} from 'stores/ResourceConfig/hooks';

type Props = {
    collectionName: string;
    readOnly?: boolean;
};

function ResourceConfigForm({ collectionName, readOnly = false }: Props) {
    const name = useRef(collectionName);

    // Resource Config Store
    const resourceConfig = useResourceConfig_resourceConfig();
    const setConfig = useResourceConfig_setResourceConfig();
    const resourceSchema = useResourceConfig_resourceSchema();
    const formData = resourceConfig[collectionName].data;

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();
    const isActive = useFormStateStore_isActive();

    useEffect(() => {
        name.current = collectionName;
    }, [collectionName]);

    const handlers = {
        onChange: (configName: string, form: any) => {
            setConfig(configName, form);
        },
    };

    const uiSchema = useMemo(
        () => custom_generateDefaultUISchema(resourceSchema),
        [resourceSchema]
    );
    const showValidationVal = useMemo(
        () => showValidation(displayValidation),
        [displayValidation]
    );

    return (
        <StyledEngineProvider injectFirst>
            <JsonForms
                {...jsonFormsDefaults}
                schema={resourceSchema}
                uischema={uiSchema}
                data={formData}
                readonly={readOnly || isActive}
                validationMode={showValidationVal}
                onChange={(state) => {
                    handlers.onChange(name.current, state);
                }}
            />
        </StyledEngineProvider>
    );
}

export default ResourceConfigForm;
