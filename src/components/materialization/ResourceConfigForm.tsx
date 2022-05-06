import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { StyledEngineProvider } from '@mui/material';
import useCreationStore, {
    CreationState,
} from 'components/materialization/Store';
import useEntityStore, {
    fooSelectors,
    FormStatus,
} from 'components/shared/Entity/Store';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { createJSONFormDefaults, setDefaultsValidator } from 'services/ajv';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';
import { StoreSelector } from 'types';

type Props = {
    resourceSchema: any;
    collectionName: string;
};

const stateSelectors: StoreSelector<CreationState> = {
    setConfig: (state) => state.setResourceConfig,
};

function NewMaterializationResourceConfigForm({
    resourceSchema,
    collectionName,
}: Props) {
    const setConfig = useCreationStore(stateSelectors.setConfig);
    const formData = useCreationStore(
        (state) => state.resourceConfig[collectionName].data
    );
    const displayValidation = useEntityStore(fooSelectors.displayValidation);
    const status = useEntityStore(fooSelectors.formStateStatus);

    // Resolve Refs & Hydrate the object
    //  This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        setConfig(collectionName, {
            data: createJSONFormDefaults(resourceSchema),
        });
    }, [collectionName, resourceSchema, setConfig]);

    const uiSchema = generateCustomUISchema(resourceSchema);
    const showValidationVal = showValidation(displayValidation);

    const handlers = {
        onChange: (form: any) => {
            if (!isEmpty(form.data)) {
                setConfig(form);
            }
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
                readonly={status !== FormStatus.IDLE}
                validationMode={showValidationVal}
                onChange={handlers.onChange}
                ajv={setDefaultsValidator}
            />
        </StyledEngineProvider>
    );
}

export default NewMaterializationResourceConfigForm;
