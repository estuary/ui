import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Stack, Typography } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import { ConnectorTag } from 'components/capture/create';
import useCaptureCreationStore, {
    CaptureCreationFormStatus,
    CaptureCreationState,
} from 'components/capture/Store';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { StoreSelector } from 'types';
import { getConnectorName } from 'utils/misc-utils';

interface Props {
    connectorTags: ConnectorTag[];
}

const stateSelectors: StoreSelector<CaptureCreationState> = {
    formData: (state) => state.details.data,
    setDetails: (state) => state.setDetails,
    setConnectors: (state) => state.setConnectors,
    showValidation: (state) => state.formState.showValidation,
    status: (state) => state.formState.status,
};

function NewCaptureDetails({ connectorTags }: Props) {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const connectorID = searchParams.get(
        routeDetails.capture.create.params.connectorID
    );

    const formData = useCaptureCreationStore(stateSelectors.formData);
    const setDetails = useCaptureCreationStore(stateSelectors.setDetails);
    const displayValidation = useCaptureCreationStore(
        stateSelectors.showValidation
    );
    const status = useCaptureCreationStore(stateSelectors.status);

    useEffect(() => {
        if (connectorID) {
            setDetails({
                data: {
                    name: '',
                    image: {
                        id: connectorID,
                        path: '',
                    },
                },
            });
        }
    }, [connectorID, setDetails]);

    const schema = useMemo(() => {
        return {
            properties: {
                image: {
                    description: intl.formatMessage({
                        id: 'captureCreation.image.description',
                    }),
                    oneOf:
                        connectorTags.length > 0
                            ? connectorTags.map((connector) => {
                                  return {
                                      const: {
                                          id: connector.id,
                                          iconPath:
                                              connector.connectors.open_graph[
                                                  'en-US'
                                              ].image,
                                      },
                                      title: getConnectorName(connector),
                                  };
                              })
                            : ([] as { title: string; const: string }[]),
                    type: 'object',
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
        };
    }, [connectorTags, intl]);

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

    return (
        <>
            <Typography variant="h5">Capture Details</Typography>

            <FormattedMessage id="captureCreation.instructions" />

            <Stack direction="row" spacing={2}>
                {schema.properties.image.oneOf.length > 0 ? (
                    <JsonForms
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={status !== CaptureCreationFormStatus.IDLE}
                        validationMode={showValidation(displayValidation)}
                        onChange={setDetails}
                    />
                ) : (
                    <Alert severity="warning">
                        <FormattedMessage id="captureCreation.missingConnectors" />
                    </Alert>
                )}
            </Stack>
        </>
    );
}

export default NewCaptureDetails;
