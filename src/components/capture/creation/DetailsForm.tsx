import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { DialogContentText, Skeleton, Stack } from '@mui/material';
import useConnectors from 'hooks/useConnectors';
import { Dispatch, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { Action, ActionType, NewCaptureStateType } from './Reducer';

type NewCaptureDetailsProps = {
    displayValidation: boolean;
    readonly: boolean;
    state: NewCaptureStateType['details'];
    dispatch: Dispatch<Action>;
};

function NewCaptureDetails(props: NewCaptureDetailsProps) {
    const intl = useIntl();
    const { state, dispatch, readonly, displayValidation } = props;

    const { isFetchingConnectors, connectors, fetchingConnectorsError } =
        useConnectors();

    const [schema, setSchema] = useState({
        type: 'object',
        required: ['name', 'image'],
        properties: {
            name: {
                description: intl.formatMessage({
                    id: 'captureCreation.name.description',
                }),
                type: 'string',
                minLength: 3,
                maxLength: 1000,
                pattern: '^[a-zA-Z0-9_.-]*/[a-zA-Z0-9_.-]+$',
            },
            image: {
                description: intl.formatMessage({
                    id: 'captureCreation.image.description',
                }),
                type: 'string',
                oneOf: [] as { title: string; const: string }[],
            },
        },
    });
    const uiSchema = {
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

    useEffect(() => {
        setSchema((previous: typeof schema) => {
            previous.properties.image.oneOf = connectors.map((connector) => {
                return {
                    title: connector.attributes.name,
                    const: connector.links.images,
                };
            });

            return previous;
        });
    }, [connectors]);

    return (
        <>
            <DialogContentText>
                <FormattedMessage id="captureCreation.instructions" />
            </DialogContentText>

            <Stack direction="row" spacing={2}>
                {fetchingConnectorsError ? (
                    fetchingConnectorsError
                ) : isFetchingConnectors ? (
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
                ) : (
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
                                    type: ActionType.DETAILS_CHANGED,
                                    payload: form,
                                });
                            } else {
                                dispatch({
                                    type: ActionType.CONNECTOR_CHANGED,
                                    payload: form.data.image as string,
                                });
                            }
                        }}
                    />
                )}
            </Stack>
        </>
    );
}

export default NewCaptureDetails;
