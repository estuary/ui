import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, AlertTitle, StyledEngineProvider } from '@mui/material';
import FormLoading from 'components/shared/FormLoading';
import useConnectorImageSpec from 'hooks/useConnectorImagesSpec';
import { isEmpty } from 'lodash';
import { Dispatch, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'stores/CaptureCreationStore';
import shallow from 'zustand/shallow';
import { Action, ActionType, NewCaptureState } from './Reducer';

type NewCaptureSpecFormProps = {
    displayValidation: boolean;
    readonly: boolean;

    state: NewCaptureState['spec'];
    dispatch: Dispatch<Action>;
};

const defaultAjv = createAjv({ useDefaults: true });

const linksSelector = (state: CaptureCreationState) => [state.links.spec];

function NewCaptureSpecForm(props: NewCaptureSpecFormProps) {
    const { state, dispatch, readonly, displayValidation } = props;

    const [endpoint] = useCaptureCreationStore(linksSelector, shallow);

    const { isIdle, isLoading, isSuccess, error, data } =
        useConnectorImageSpec(endpoint);

    const {
        links: { discovered_catalog, documentation },
        endpointSchema,
    } = data;

    useEffect(() => {
        if (discovered_catalog.length > 0) {
            dispatch({
                payload: discovered_catalog,
                type: ActionType.NEW_DISCOVERY_LINK,
            });
        }
    }, [discovered_catalog, dispatch]);

    useEffect(() => {
        if (documentation.length > 0) {
            dispatch({
                payload: documentation,
                type: ActionType.NEW_DOCS_LINK,
            });
        }
    }, [documentation, dispatch]);

    // This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        if (isSuccess) {
            const hydrateAndValidate = defaultAjv.compile(endpointSchema);
            const defaultValues = {};
            hydrateAndValidate(defaultValues);

            dispatch({
                payload: {
                    data: defaultValues,
                },
                type: ActionType.CAPTURE_SPEC_CHANGED,
            });
        }
    }, [dispatch, endpointSchema, isSuccess]);

    if (isIdle || isLoading) {
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
                    dispatch({
                        payload: form,
                        type: ActionType.CAPTURE_SPEC_CHANGED,
                    });
                }
            },
        };

        return (
            <StyledEngineProvider injectFirst>
                <JsonForms
                    schema={endpointSchema}
                    uischema={uiSchema}
                    data={state}
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
