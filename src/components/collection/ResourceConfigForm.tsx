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
    useResourceConfig_resourceConfigOfCollectionProperty,
    useResourceConfig_resourceSchema,
    useResourceConfig_updateResourceConfig,
} from 'stores/ResourceConfig/hooks';

type Props = {
    collectionName: string;
    readOnly?: boolean;
};

function ResourceConfigForm({ collectionName, readOnly = false }: Props) {
    console.log('ResourceConfigForm ', collectionName);
    const name = useRef(collectionName);

    // Resource Config Store
    const formData =
        useResourceConfig_resourceConfigOfCollectionProperty(
            collectionName,
            'data'
        ) ?? {};
    const updateResourceConfig = useResourceConfig_updateResourceConfig();
    const resourceSchema = useResourceConfig_resourceSchema();

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();
    const isActive = useFormStateStore_isActive();

    useEffect(() => {
        name.current = collectionName;
    }, [collectionName]);

    const handlers = {
        onChange: (configName: string, form: any) => {
            updateResourceConfig(configName, form);
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
