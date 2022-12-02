import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import { cloneDeep } from 'lodash';
import { useEffect, useRef } from 'react';
import { setDefaultsValidator } from 'services/ajv';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
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

const COLLECTION_NAME_ANNOTATION = 'x-collection-name';

function ResourceConfigForm({ collectionName, readOnly = false }: Props) {
    const name = useRef(collectionName);

    // Resource Config Store
    const resourceConfig = useResourceConfig_resourceConfig();
    const setConfig = useResourceConfig_setResourceConfig();

    let formData = resourceConfig[collectionName].data;

    const resourceSchema = useResourceConfig_resourceSchema();

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

    // Find field with x-collection-name annotation and fill it with the
    // collection name
    if (resourceSchema.properties) {
        const collectionNameField = Object.entries(resourceSchema.properties)
          .find(([_, value]) => value && COLLECTION_NAME_ANNOTATION in value) ?? [];
        const collectionNameFieldKey = collectionNameField[0];

        if (collectionNameFieldKey) {
            const collectionNameSplit = collectionName.split('/');
            formData = cloneDeep(formData);
            formData[collectionNameFieldKey] =
                collectionNameSplit[collectionNameSplit.length - 1];
        }
    }

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
