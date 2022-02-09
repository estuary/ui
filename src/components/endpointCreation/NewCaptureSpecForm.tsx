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
import { defaultOptions, defaultRenderers } from 'forms/Helper';
import useSourceSchema from 'hooks/useSourceSchema';
import { FormattedMessage } from 'react-intl';
import { useNewCaptureContext } from './NewCaptureContext';
import { ActionType } from './NewCaptureReducer';

type NewCaptureSpecFormProps = {
    displayValidation: boolean;
    readonly: boolean;
};

function NewCaptureSpecForm(props: NewCaptureSpecFormProps) {
    const { state, dispatch } = useNewCaptureContext();

    const { isFetching, sourceSchema, error, image } = useSourceSchema(
        state.details.image
    );
    const handleDefaultsAjv = createAjv({ useDefaults: true });

    if (isFetching) {
        return <FormLoading />;
    } else if (error !== null) {
        return (
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="common.errors.heading" />
                </AlertTitle>
                {error}
            </Alert>
        );
    } else if (sourceSchema !== null) {
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
                            {image}
                        </Typography>
                        {sourceSchema.documentationUrl ? (
                            <ExternalLink link={sourceSchema.documentationUrl}>
                                <FormattedMessage id="captureCreation.config.source.doclink" />
                            </ExternalLink>
                        ) : null}
                    </Toolbar>
                </AppBar>
                <Divider />
                <StyledEngineProvider injectFirst>
                    <JsonForms
                        schema={sourceSchema}
                        data={state.spec}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={props.readonly}
                        ajv={handleDefaultsAjv}
                        validationMode={
                            props.displayValidation
                                ? 'ValidateAndShow'
                                : 'ValidateAndHide'
                        }
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
