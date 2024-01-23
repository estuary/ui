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
    currentCollection: number;
    readOnly?: boolean;
};

function ResourceConfigForm({ currentCollection, readOnly = false }: Props) {
    const name = useRef(currentCollection);

    // Resource Config Store
    const formData = useResourceConfig_resourceConfigOfCollectionProperty(
        currentCollection,
        'data'
    );

    const updateResourceConfig = useResourceConfig_updateResourceConfig();
    const resourceSchema = useResourceConfig_resourceSchema();

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();
    const isActive = useFormStateStore_isActive();

    useEffect(() => {
        name.current = currentCollection;
    }, [currentCollection]);

    const handlers = {
        onChange: (configIndex: number, form: any) => {
            updateResourceConfig(configIndex, form);
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
                    handlers.onChange(name.current, state);
                }}
            />
        </StyledEngineProvider>
    );
}

export default ResourceConfigForm;
