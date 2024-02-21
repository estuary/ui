import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { jsonFormsDefaults } from 'services/jsonforms/defaults';
import { showValidation } from 'services/jsonforms/shared';
import {
    useBinding_resourceConfigOfCollectionProperty,
    useBinding_resourceSchema,
    useBinding_updateResourceConfig,
} from 'stores/Binding/hooks';
import {
    useFormStateStore_displayValidation,
    useFormStateStore_isActive,
} from 'stores/FormState/hooks';

type Props = {
    bindingUUID: string;
    collectionName: string;
    readOnly?: boolean;
};

function ResourceConfigForm({
    bindingUUID,
    collectionName,
    readOnly = false,
}: Props) {
    const uuid = useRef(bindingUUID);
    const name = useRef(collectionName);

    // Binding Store
    const formData = useBinding_resourceConfigOfCollectionProperty(
        bindingUUID,
        'data'
    );

    const resourceSchema = useBinding_resourceSchema();
    const updateResourceConfig = useBinding_updateResourceConfig();

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();
    const isActive = useFormStateStore_isActive();

    useEffect(() => {
        uuid.current = bindingUUID;
    }, [bindingUUID]);

    useEffect(() => {
        name.current = collectionName;
    }, [collectionName]);

    const handlers = {
        onChange: (
            configName: string,
            targetBindingUUID: string,
            form: any
        ) => {
            updateResourceConfig(configName, targetBindingUUID, form);
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

    // Should never happen but just being very safe so the page does not blow up
    if (!formData) {
        return null;
    }

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
                    handlers.onChange(name.current, uuid.current, state);
                }}
            />
        </StyledEngineProvider>
    );
}

export default ResourceConfigForm;
