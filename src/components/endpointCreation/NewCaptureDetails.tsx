import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { DialogContentText, Skeleton, Stack } from '@mui/material';
import { defaultOptions, defaultRenderers, showValidation } from 'forms/Helper';
import useConnectors from 'hooks/useConnectors';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNewCaptureContext } from './NewCaptureContext';
import { ActionType } from './NewCaptureReducer';

type NewCaptureDetailsProps = {
    displayValidation: boolean;
    readonly: boolean;
};

function NewCaptureDetails(props: NewCaptureDetailsProps) {
    const intl = useIntl();
    const { state, dispatch } = useNewCaptureContext();
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
                oneOf: [],
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
        setSchema((previous: any) => {
            previous.properties.image.oneOf = connectors.map(
                (connector: any) => {
                    return {
                        title: connector.attributes.name,
                        const: connector.links.images,
                    };
                }
            );

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
                    <>Error</>
                ) : isFetchingConnectors ? (
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
                ) : (
                    <JsonForms
                        schema={schema}
                        uischema={uiSchema}
                        data={state.details.data}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={props.readonly}
                        validationMode={showValidation(props.displayValidation)}
                        onChange={(data) => {
                            if (state.details.data.image !== data.data.image) {
                                dispatch({
                                    type: ActionType.CONNECTOR_CHANGED,
                                    payload: data.data.image as string,
                                });
                            } else {
                                dispatch({
                                    type: ActionType.DETAILS_CHANGED,
                                    payload: data,
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
