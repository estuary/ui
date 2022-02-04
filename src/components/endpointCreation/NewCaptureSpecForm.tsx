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
import { getDefaultOptions, getRenderers } from 'forms/Helper';
import useSourceSchema from 'hooks/useSourceSchema';
import { FormattedMessage } from 'react-intl';

type NewCaptureSpecFormProps = {
    displayValidation: boolean;
    connectorImage: string | null;
    formData: object;
    onFormChange: any; //fn
    readonly: boolean;
};

function NewCaptureSpecForm(props: NewCaptureSpecFormProps) {
    const { isFetching, sourceSchema, error, image } = useSourceSchema(
        props.connectorImage ? props.connectorImage : ''
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
                        data={props.formData}
                        renderers={getRenderers()}
                        cells={materialCells}
                        config={getDefaultOptions()}
                        readonly={props.readonly}
                        ajv={handleDefaultsAjv}
                        validationMode={
                            props.displayValidation
                                ? 'ValidateAndShow'
                                : 'ValidateAndHide'
                        }
                        onChange={props.onFormChange}
                    />
                </StyledEngineProvider>
            </>
        );
    } else {
        return <></>;
    }
}

export default NewCaptureSpecForm;
