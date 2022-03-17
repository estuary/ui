import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, AlertTitle, StyledEngineProvider } from '@mui/material';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/creation/Store';
import FormLoading from 'components/shared/FormLoading';
import useConnectorImageSpec from 'hooks/useConnectorImagesSpec';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';
import shallow from 'zustand/shallow';

type NewCaptureSpecFormProps = {
    displayValidation: boolean;
    readonly: boolean;
};

const defaultAjv = createAjv({ useDefaults: true });

const stateSelectors = {
    specLink: (state: CaptureCreationState) => state.links.spec,
    formData: (state: CaptureCreationState) => state.spec.data,
    setLink: (state: CaptureCreationState) => state.setLink,
    setSpec: (state: CaptureCreationState) => state.setSpec,
};
function NewCaptureSpecForm(props: NewCaptureSpecFormProps) {
    const { readonly, displayValidation } = props;

    const endpoint = useCaptureCreationStore(stateSelectors.specLink, shallow);
    const setLink = useCaptureCreationStore(stateSelectors.setLink);
    const setSpec = useCaptureCreationStore(stateSelectors.setSpec);
    const formData = useCaptureCreationStore(stateSelectors.formData);

    const { isIdle, isLoading, isSuccess, error, data } =
        useConnectorImageSpec(endpoint);

    const {
        links: { discovered_catalog, documentation },
        endpointSchema,
    } = data;

    useEffect(() => {
        if (discovered_catalog.length > 0) {
            setLink('discovered_catalog', discovered_catalog);
        }
    }, [discovered_catalog, setLink]);

    useEffect(() => {
        if (documentation.length > 0) {
            setLink('documentation', documentation);
        }
    }, [documentation, setLink]);

    // This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        if (isSuccess) {
            const hydrateAndValidate = defaultAjv.compile(endpointSchema);
            const defaultValues = {};
            hydrateAndValidate(defaultValues);

            setSpec({
                data: defaultValues,
            });
        }
    }, [endpointSchema, isSuccess, setSpec]);

    if (endpoint.length === 0) {
        return null;
    } else if (isIdle || isLoading) {
        return <FormLoading />;
    } else if (error) {
        return (
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="common.errors.heading" />
                </AlertTitle>
                {error}
            </Alert>
        );
    } else if (endpointSchema.type) {
        const uiSchema = generateCustomUISchema(endpointSchema);
        const showValidationVal = showValidation(displayValidation);
        const handlers = {
            onChange: (form: any) => {
                if (!isEmpty(form.data)) {
                    setSpec(form);
                }
            },
        };

        return (
            <StyledEngineProvider injectFirst>
                <JsonForms
                    schema={endpointSchema}
                    uischema={uiSchema}
                    data={formData}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    readonly={readonly}
                    validationMode={showValidationVal}
                    onChange={handlers.onChange}
                />
            </StyledEngineProvider>
        );
    } else {
        return null;
    }
}

export default NewCaptureSpecForm;
