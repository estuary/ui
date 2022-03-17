import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, DialogContentText, Skeleton, Stack } from '@mui/material';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/creation/Store';
import { ConnectorTypes } from 'endpoints/connectors';
import useConnectors from 'hooks/useConnectors';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';

type NewCaptureDetailsProps = {
    displayValidation: boolean;
    readonly: boolean;
};

const stateSelectors = {
    formData: (state: CaptureCreationState) => state.details.data,
    setDetails: (state: CaptureCreationState) => state.setDetails,
};

function NewCaptureDetails(props: NewCaptureDetailsProps) {
    const intl = useIntl();
    const { readonly, displayValidation } = props;

    const formData = useCaptureCreationStore(stateSelectors.formData);
    const setDetails = useCaptureCreationStore(stateSelectors.setDetails);

    const {
        data: connectorsData,
        isError,
        isSuccess,
        error,
    } = useConnectors(ConnectorTypes.SOURCE);

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
            if (connectorsData && connectorsData.length > 0) {
                setSchema((previous: typeof schema) => {
                    const listOfConnectors = connectorsData.map((connector) => {
                        return {
                            const: connector.links.images,
                            title: connector.attributes.name,
                        };
                    });
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
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={readonly}
                        validationMode={showValidation(displayValidation)}
                        onChange={setDetails}
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
