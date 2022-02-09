import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { DialogContentText, Skeleton, Stack } from '@mui/material';
import { defaultOptions, defaultRenderers, showValidation } from 'forms/Helper';
import useNewCaptureSchema from 'hooks/useNewCaptureSchema';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNewCaptureContext } from './NewCaptureContext';
import { ActionType } from './NewCaptureReducer';

type NewCaptureDetailsProps = {
    displayValidation: boolean;
    readonly: boolean;
};

function NewCaptureDetails(props: NewCaptureDetailsProps) {
    const intl = useIntl();
    const { schema } = useNewCaptureSchema();
    const { state, dispatch } = useNewCaptureContext();

    const captureUISchema = {
        type: 'VerticalLayout',
        elements: [
            {
                type: 'HorizontalLayout',
                elements: [
                    {
                        type: 'Control',
                        label: intl.formatMessage({
                            id: 'captureCreation.name.label',
                        }),
                        scope: '#/properties/name',
                    },
                    {
                        type: 'Control',
                        label: intl.formatMessage({
                            id: 'captureCreation.image.label',
                        }),
                        scope: '#/properties/image',
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
                {schema !== null ? (
                    <JsonForms
                        schema={schema}
                        uischema={captureUISchema}
                        data={state.details}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={props.readonly}
                        validationMode={showValidation(props.displayValidation)}
                        onChange={(data) => {
                            dispatch({
                                type: ActionType.DETAILS_CHANGED,
                                payload: data,
                            });
                        }}
                    />
                ) : (
                    <>
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width={'50%'}
                        />
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width={'50%'}
                        />
                    </>
                )}
            </Stack>
        </>
    );
}

export default NewCaptureDetails;
