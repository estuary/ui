import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { cloneDeep } from 'lodash';
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
import { Annotations } from 'types/jsonforms';
import { stripPathing } from 'utils/misc-utils';

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

    // Find field with x-collection-name annotation
    const collectionNameFieldKey = useMemo(() => {
        if (resourceSchema.properties) {
            // Find the field with the collection name annotation
            const collectionNameField =
                Object.entries(resourceSchema.properties).find(
                    ([_, value]) =>
                        value?.hasOwnProperty(
                            Annotations.defaultResourceConfigName
                        )
                ) ?? [];

            // Try to fetch the key
            return collectionNameField[0];
        }

        return null;
    }, [resourceSchema.properties]);

    // Check if we need to add a default value
    const preparedResourceSchema = useMemo(() => {
        if (collectionNameFieldKey) {
            // Add a default property set to the stripped collection name
            const response = cloneDeep(resourceSchema);
            response.properties[collectionNameFieldKey].default =
                stripPathing(collectionName);
            return response;
        }

        return resourceSchema;
    }, [collectionName, collectionNameFieldKey, resourceSchema]);

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
                schema={preparedResourceSchema}
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
