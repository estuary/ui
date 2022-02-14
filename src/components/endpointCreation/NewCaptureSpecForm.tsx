import { createAjv } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import {
    Alert,
    AlertTitle,
    AppBar,
    Divider,
    StyledEngineProvider,
    Toolbar,
    Typography,
} from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import FormLoading from 'components/shared/FormLoading';
import { defaultOptions, defaultRenderers, showValidation } from 'forms/Helper';
import useConnectorImageSpec from 'hooks/useConnectorImages';
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
        isFetchingConnectorImages,
        connectorImageSpecSchema,
        connectorImageError,
        connectorImageName,
        connectorImageDocumentation,
    } = useConnectorImageSpec(state.details.data.image);
    const handleDefaultsAjv = createAjv({ useDefaults: true });

    if (isFetchingConnectorImages) {
        return <FormLoading />;
    } else if (connectorImageError !== null) {
        return (
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="common.errors.heading" />
                </AlertTitle>
                {connectorImageError}
            </Alert>
        );
    } else if (connectorImageSpecSchema !== null) {
        return (
            <>
                <AppBar position="relative" elevation={0} color="default">
                    <Toolbar
                        variant="dense"
                        sx={{
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography variant="h5" color="initial">
                            {connectorImageName}
                        </Typography>
                        {connectorImageDocumentation !== '' ? (
                            <ExternalLink link={connectorImageDocumentation}>
                                <FormattedMessage id="captureCreation.config.source.doclink" />
                            </ExternalLink>
                        ) : null}
                    </Toolbar>
                </AppBar>
                <Divider />
                <StyledEngineProvider injectFirst>
                    <JsonForms
                        schema={connectorImageSpecSchema}
                        data={state.spec.data}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={props.readonly}
                        ajv={handleDefaultsAjv}
                        validationMode={showValidation(props.displayValidation)}
                        onChange={(event) => {
                            dispatch({
                                type: ActionType.CAPTURE_SPEC_CHANGED,
                                payload: event,
                            });
                        }}
                    />
                </StyledEngineProvider>
            </>
        );
    } else {
        return <></>;
    }
}

export default NewCaptureSpecForm;
