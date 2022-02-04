import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { DialogContentText, Skeleton, Stack } from '@mui/material';
import { getDefaultOptions, getRenderers } from 'forms/Helper';
import useCaptureSchema from 'hooks/useCaptureSchema';
import { FormattedMessage, useIntl } from 'react-intl';

type NewCaptureDetailsProps = {
    displayValidation: boolean;
    formData: object;
    onFormChange: any; //fn
    readonly: boolean;
};

function NewCaptureDetails(props: NewCaptureDetailsProps) {
    const intl = useIntl();
    const captureSchema = useCaptureSchema();
    const captureUISchema = {
        type: 'VerticalLayout',
        elements: [
            {
                type: 'HorizontalLayout',
                elements: [
                    {
                        type: 'Control',
                        label: intl.formatMessage({
                            id: 'captureCreation.tenant.label',
                        }),
                        scope: '#/properties/tenantName',
                    },
                    {
                        type: 'Control',
                        label: intl.formatMessage({
                            id: 'captureCreation.name.label',
                        }),
                        scope: '#/properties/captureName',
                    },
                    {
                        type: 'Control',
                        label: intl.formatMessage({
                            id: 'captureCreation.source.label',
                        }),
                        scope: '#/properties/sourceType',
                    },
                ],
            },
        ],
    };
    return (
        <>
            <DialogContentText>
                <FormattedMessage id="captureCreation.instructions" />
            </DialogContentText>

            <Stack direction="row" spacing={2}>
                {captureSchema.schema !== null ? (
                    <JsonForms
                        schema={captureSchema.schema}
                        uischema={captureUISchema}
                        data={props.formData}
                        renderers={getRenderers()}
                        cells={materialCells}
                        config={getDefaultOptions()}
                        readonly={props.readonly}
                        validationMode={
                            props.displayValidation
                                ? 'ValidateAndShow'
                                : 'ValidateAndHide'
                        }
                        onChange={props.onFormChange}
                    />
                ) : (
                    <>
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width={'33%'}
                        />
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width={'33%'}
                        />
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width={'33%'}
                        />
                    </>
                )}
            </Stack>
        </>
    );
}

export default NewCaptureDetails;
