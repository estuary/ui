import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, AlertTitle, StyledEngineProvider } from '@mui/material';
import FormLoading from 'components/shared/FormLoading';
import {
    defaultOptions,
    defaultRenderers,
    generateUISchema,
    showValidation,
} from 'forms/Helper';
import useConnectorImageSpec from 'hooks/useConnectorImagesSpec';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNewCaptureContext } from './NewCaptureContext';
import { ActionType } from './NewCaptureReducer';

type NewCaptureSpecFormProps = {
    displayValidation: boolean;
    readonly: boolean;
};

function NewCaptureSpecForm(props: NewCaptureSpecFormProps) {
    const { state, dispatch } = useNewCaptureContext();

    const {
        isFetchingConnectorImageSpec,
        connectorImageSpecSchema,
        connectorImageSpecError,
        // connectorImageDocumentation,
        connectorImageDiscoveryLink,
    } = useConnectorImageSpec(state.endpoints.spec);

    useEffect(() => {
        dispatch({
            type: ActionType.ENDPOINT_CHANGED_SUBMIT,
            payload: connectorImageDiscoveryLink,
        });
    }, [connectorImageDiscoveryLink, dispatch]);

    if (isFetchingConnectorImageSpec) {
        return <FormLoading />;
    } else if (connectorImageSpecError !== null) {
        return (
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="common.errors.heading" />
                </AlertTitle>
                {connectorImageSpecError}
            </Alert>
        );
    } else if (connectorImageSpecSchema !== null) {
        const handleDefaultsAjv = createAjv({ useDefaults: true });
        const uiSchema = generateUISchema(connectorImageSpecSchema);

        return (
            <>
                {isFetchingConnectorImageSpec ? (
                    <FormLoading />
                ) : connectorImageSpecSchema ? (
                    <StyledEngineProvider injectFirst>
                        <JsonForms
                            schema={connectorImageSpecSchema}
                            uischema={uiSchema}
                            data={state.spec.data}
                            renderers={defaultRenderers}
                            cells={materialCells}
                            config={defaultOptions}
                            readonly={props.readonly}
                            ajv={handleDefaultsAjv}
                            validationMode={showValidation(
                                props.displayValidation
                            )}
                            onChange={(event) => {
                                dispatch({
                                    type: ActionType.CAPTURE_SPEC_CHANGED,
                                    payload: event,
                                });
                            }}
                        />
                    </StyledEngineProvider>
                ) : null}
            </>
        );
    } else {
        return <></>;
    }
}

export default NewCaptureSpecForm;
