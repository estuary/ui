import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Stack, Typography } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import { ConnectorTag } from 'components/shared/Entity/query';
import useFooState, {
    EntityStoreState,
    FormStatus,
} from 'components/shared/Entity/Store';
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
    messagePrefix: 'materializationCreation' | 'captureCreation';
}

const stateSelectors: StoreSelector<EntityStoreState> = {
    formData: (state) => state.details.data,
    setDetails: (state) => state.setDetails,
    setConnectors: (state) => state.setConnectors,
    showValidation: (state) => state.formState.displayValidation,
    status: (state) => state.formState.status,
};

function DetailsForm({ connectorTags, messagePrefix }: Props) {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const connectorID = searchParams.get(
        routeDetails.captures.create.params.connectorID
    );

    const formData = useFooState(stateSelectors.formData);
    const setDetails = useFooState(stateSelectors.setDetails);
    const displayValidation = useFooState(stateSelectors.showValidation);
    const status = useFooState(stateSelectors.status);

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
                        id: 'connector.description',
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
                                      title: getConnectorName(
                                          connector.connectors.open_graph
                                      ),
                                  };
                              })
                            : ([] as { title: string; const: string }[]),
                    type: 'object',
                },
                name: {
                    description: intl.formatMessage({
                        id: 'entityName.description',
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
                            id: 'entityName.label',
                        }),
                        scope: '#/properties/name',
                        type: 'Control',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'connector.label',
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
            <Typography variant="h5">
                <FormattedMessage id={`${messagePrefix}.details.heading`} />
            </Typography>

            <FormattedMessage id={`${messagePrefix}.instructions`} />

            <Stack direction="row" spacing={2}>
                {schema.properties.image.oneOf.length > 0 ? (
                    <JsonForms
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={status !== FormStatus.IDLE}
                        validationMode={showValidation(displayValidation)}
                        onChange={setDetails}
                    />
                ) : (
                    <Alert severity="warning">
                        <FormattedMessage
                            id={`${messagePrefix}.missingConnectors`}
                        />
                    </Alert>
                )}
            </Stack>
        </>
    );
}

export default DetailsForm;
