import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, DialogContentText, Skeleton, Stack } from '@mui/material';
import useConnectors from 'hooks/useConnectors';
import { Dispatch, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { Action, ActionType, NewCaptureState } from './Reducer';

type NewCaptureDetailsProps = {
    displayValidation: boolean;
    readonly: boolean;
    state: NewCaptureState['details'];
    dispatch: Dispatch<Action>;
};

function NewCaptureDetails(props: NewCaptureDetailsProps) {
    const intl = useIntl();
    const { state, dispatch, readonly, displayValidation } = props;

    const { data: connectorsData, isError, isSuccess, error } = useConnectors();

    const [isPostProcessingDone, setPostProcessingDone] = useState(false);
    const [schema, setSchema] = useState({
        properties: {
            image: {
                description: intl.formatMessage({
                    id: 'captureCreation.image.description',
                }),
                oneOf: [] as { title: string; const: string }[],
                type: 'string',
            },
            name: {
                description: intl.formatMessage({
                    id: 'captureCreation.name.description',
                }),
                maxLength: 1000,
                minLength: 3,
                pattern: '^[a-zA-Z0-9_.-]*/[a-zA-Z0-9_.-]+$',
                type: 'string',
            },
        },
        required: ['name', 'image'],
        type: 'object',
    });
    const uiSchema = {
        elements: [
            {
                elements: [
                    {
                        label: intl.formatMessage({
                            id: 'captureCreation.name.label',
                        }),
                        scope: '#/properties/name',
                        type: 'Control',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'captureCreation.image.label',
                        }),
                        scope: '#/properties/image',
                        type: 'Control',
                    },
                ],
                type: 'HorizontalLayout',
            },
        ],
        type: 'VerticalLayout',
    };

    useEffect(() => {
        if (isSuccess) {
            if (connectorsData && connectorsData.data.length > 0) {
                setSchema((previous: typeof schema) => {
                    const listOfConnectors = connectorsData.data.map(
                        (connector) => {
                            return {
                                const: connector.links.images,
                                title: connector.attributes.name,
                            };
                        }
                    );
                    previous.properties.image.oneOf = listOfConnectors;

                    return previous;
                });
            }

            setPostProcessingDone(true);
        }
    }, [connectorsData, isSuccess]);

    return (
        <>
            <DialogContentText>
                <FormattedMessage id="captureCreation.instructions" />
            </DialogContentText>

            <Stack direction="row" spacing={2}>
                {isPostProcessingDone ? (
                    <JsonForms
                        schema={schema}
                        uischema={uiSchema}
                        data={state.data}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={readonly}
                        validationMode={showValidation(displayValidation)}
                        onChange={(form) => {
                            if (state.data.image === form.data.image) {
                                dispatch({
                                    payload: form,
                                    type: ActionType.DETAILS_CHANGED,
                                });
                            } else {
                                dispatch({
                                    payload: form.data.image as string,
                                    type: ActionType.CONNECTOR_CHANGED,
                                });
                            }
                        }}
                    />
                ) : isError ? (
                    error
                ) : schema.properties.image.oneOf.length < 0 ? (
                    <Alert severity="warning">
                        <FormattedMessage id="captureCreation.missingConnectors" />
                        {schema.properties.image.oneOf.length}
                    </Alert>
                ) : (
                    <>
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width="50%"
                        />
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width="50%"
                        />
                    </>
                )}
            </Stack>
        </>
    );
}

export default NewCaptureDetails;
