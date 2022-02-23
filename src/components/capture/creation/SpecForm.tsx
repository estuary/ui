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
import { Action, ActionType, NewCaptureStateType } from './Reducer';

type NewCaptureSpecFormProps = {
    displayValidation: boolean;
    readonly: boolean;

    state: NewCaptureStateType['spec'];
    dispatch: Dispatch<Action>;
    endpoint: string;
};

const defaultAjv = createAjv({ useDefaults: true });

function NewCaptureSpecForm(props: NewCaptureSpecFormProps) {
    const { state, dispatch, endpoint, readonly, displayValidation } = props;

    const {
        loading,
        error,
        data: {
            specSchema,
            links: { discovery, documentation },
        },
    } = useConnectorImageSpec(endpoint);

    useEffect(() => {
        dispatch({
            type: ActionType.NEW_DISCOVERY_LINK,
            payload: discovery,
        });
    }, [discovery, dispatch]);

    useEffect(() => {
        dispatch({
            type: ActionType.NEW_DOCS_LINK,
            payload: documentation,
        });
    }, [documentation, dispatch]);

    // This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        const hydrateAndValidate = defaultAjv.compile(specSchema);
        const defaultValues = {};
        hydrateAndValidate(defaultValues);

        dispatch({
            type: ActionType.CAPTURE_SPEC_CHANGED,
            payload: {
                data: defaultValues,
            },
        });
    }, [specSchema, dispatch]);

    if (loading) {
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
    } else if (specSchema.type) {
        const uiSchema = generateCustomUISchema(specSchema);

        return (
            <StyledEngineProvider injectFirst>
                <JsonForms
                    schema={specSchema}
                    uischema={uiSchema}
                    data={state}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    readonly={readonly}
                    validationMode={showValidation(displayValidation)}
                    onChange={(form) => {
                        if (!isEmpty(form.data)) {
                            dispatch({
                                type: ActionType.CAPTURE_SPEC_CHANGED,
                                payload: form,
                            });
                        }
                    }}
                />
            </StyledEngineProvider>
        );
    } else {
        return null;
    }
}

export default NewCaptureSpecForm;
