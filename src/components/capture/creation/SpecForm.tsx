import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, AlertTitle, StyledEngineProvider } from '@mui/material';
import FormLoading from 'components/shared/FormLoading';
import useConnectorImageSpec from 'hooks/useConnectorImagesSpec';
import JsonRefs from 'json-refs';
import { isEmpty } from 'lodash';
import { Dispatch, useEffect, useState } from 'react';
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

    const [isPostProcessingDone, setPostProcessingDone] = useState(false);
    const { isSuccess, error, data } = useConnectorImageSpec(endpoint);

    const {
        links: { discovery },
        attributes: { documentationURL, endpointSpecSchema },
    } = data?.data ?? {
        attributes: {
            documentationURL: null,
            endpointSpecSchema: null,
        },
        links: {
            discovery: null,
        },
    };

    useEffect(() => {
        if (discovery) {
            dispatch({
                payload: discovery,
                type: ActionType.NEW_DISCOVERY_LINK,
            });
        }
    }, [discovery, dispatch]);

    useEffect(() => {
        if (documentationURL) {
            dispatch({
                payload: documentationURL,
                type: ActionType.NEW_DOCS_LINK,
            });
        }
    }, [documentationURL, dispatch]);

    // This will hydrate the default values for us as we don't want JSONForms to
    //  directly update the state object as it caused issues when switching connectors.
    useEffect(() => {
        if (isSuccess) {
            if (endpointSpecSchema) {
                JsonRefs.resolveRefs(endpointSpecSchema)
                    .then((derefSchema) => {
                        const hydrateAndValidate = defaultAjv.compile(
                            derefSchema.resolved
                        );
                        const defaultValues = {};
                        hydrateAndValidate(defaultValues);

                        setPostProcessingDone(true);
                        dispatch({
                            payload: {
                                data: defaultValues,
                            },
                            type: ActionType.CAPTURE_SPEC_CHANGED,
                        });
                    })
                    .catch((resolveRefError) => {
                        // setError([
                        //     {
                        //         detail: 'Failed to resolve the JSON returned from the server',
                        //         title: resolveRefError.message,
                        //     },
                        // ]);
                        return Promise.reject(resolveRefError.message);
                    });
            }
        }
    }, [endpointSpecSchema, dispatch, isSuccess, data]);

    if (!isPostProcessingDone) {
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
    } else if (endpointSpecSchema?.type) {
        const uiSchema = generateCustomUISchema(endpointSpecSchema);

        return (
            <StyledEngineProvider injectFirst>
                <JsonForms
                    schema={endpointSpecSchema}
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
