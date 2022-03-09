import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, AlertTitle, StyledEngineProvider } from '@mui/material';
import FormLoading from 'components/shared/FormLoading';
import useConnectorImageSpec from 'hooks/useConnectorImagesSpec';
import { isEmpty } from 'lodash';
import { Dispatch, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    generateCustomUISchema,
    showValidation,
} from 'services/jsonforms';
import { Action, ActionType, NewCaptureState } from './Reducer';

type NewCaptureSpecFormProps = {
    displayValidation: boolean;
    readonly: boolean;

    state: NewCaptureState['spec'];
    dispatch: Dispatch<Action>;
    endpoint: string;
};

const defaultAjv = createAjv({ useDefaults: true });

function NewCaptureSpecForm(props: NewCaptureSpecFormProps) {
    const { state, dispatch, endpoint, readonly, displayValidation } = props;

    const { isIdle, isLoading, isSuccess, error, data } =
        useConnectorImageSpec(endpoint);

    const {
        links: { discovery, documentation },
        endpointSchema,
    } = data;

    useEffect(() => {
        dispatch({
            payload: discovery,
            type: ActionType.NEW_DISCOVERY_LINK,
        });
    }, [discovery, dispatch]);

    useEffect(() => {
        dispatch({
            payload: documentation,
            type: ActionType.NEW_DOCS_LINK,
        });
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

    const uiSchema = useMemo(() => {
        if (endpointSchema.type) {
            return generateCustomUISchema(endpointSchema);
        } else {
            return null;
        }
    }, [endpointSchema]);

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
    } else if (uiSchema) {
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
                    validationMode={showValidation(displayValidation)}
                    onChange={(form) => {
                        if (!isEmpty(form.data)) {
                            dispatch({
                                payload: form,
                                type: ActionType.CAPTURE_SPEC_CHANGED,
                            });
                        }
                    }}
                />
            </StyledEngineProvider>
        );
    } else {
        return <>uh oh!</>;
    }
}

export default NewCaptureSpecForm;
