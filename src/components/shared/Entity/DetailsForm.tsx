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
import { Grants, StoreSelector } from 'types';
import { getConnectorName } from 'utils/misc-utils';

interface Props {
    connectorTags: ConnectorTag[];
    accessGrants: Grants[];
    messagePrefix: 'materializationCreation' | 'captureCreation';
}

const stateSelectors: StoreSelector<EntityStoreState> = {
    formData: (state) => state.details.data,
    setDetails: (state) => state.setDetails,
    setConnectors: (state) => state.setConnectors,
    showValidation: (state) => state.formState.displayValidation,
    status: (state) => state.formState.status,
};

function DetailsForm({ connectorTags, messagePrefix, accessGrants }: Props) {
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
                    prefix: {
                        id: '',
                        title: '',
                    },
                    name: '',
                    image: {
                        id: connectorID,
                        path: '',
                    },
                },
            });
        }
    }, [connectorID, setDetails]);

    const accessGrantsOneOf = useMemo(() => {
        const response = [] as { title: string; const: Object }[];

        if (accessGrants.length > 0) {
            accessGrants.forEach((accessGrant) => {
                response.push({
                    const: {
                        id: accessGrant.id,
                        title: accessGrant.object_role,
                    },
                    title: accessGrant.object_role,
                });
            });
        }

        return response;
    }, [accessGrants]);

    const connectorsOneOf = useMemo(() => {
        const response = [] as { title: string; const: Object }[];

        if (connectorTags.length > 0) {
            connectorTags.forEach((connector) => {
                response.push({
                    const: {
                        id: connector.id,
                        iconPath:
                            connector.connectors.open_graph['en-US'].image,
                    },
                    title: getConnectorName(connector.connectors.open_graph),
                });
            });
        }

        return response;
    }, [connectorTags]);

    const schema = useMemo(() => {
        return {
            properties: {
                image: {
                    description: intl.formatMessage({
                        id: 'connector.description',
                    }),
                    oneOf: connectorsOneOf,
                    type: 'object',
                },
                prefix: {
                    description: intl.formatMessage({
                        id: 'entityPrefix.description',
                    }),
                    oneOf: accessGrantsOneOf,
                    type: 'object',
                },
                name: {
                    description: intl.formatMessage({
                        id: 'entityName.description',
                    }),
                    // TODO (prefix) Make prefix a part of the name field
                    // This pattern needs to match https://github.com/estuary/animated-carnival/blob/main/supabase/migrations/03_catalog-types.sql
                    // Right now with prefix broken out it means the first part is a bit different
                    // `^([a-zA-Z0-9-_.]+/)+[a-zA-Z0-9-_.]+$`
                    pattern: `^([a-zA-Z0-9-_./])+[^/]$`,
                    type: 'string',
                },
                description: {
                    description: intl.formatMessage({
                        id: 'description.description',
                    }),
                    type: 'string',
                },
            },
            required: ['prefix', 'name', 'image'],
            type: 'object',
        };
    }, [accessGrantsOneOf, connectorsOneOf, intl]);

    const uiSchema = {
        elements: [
            {
                elements: [
                    {
                        label: intl.formatMessage({
                            id: 'entityPrefix.label',
                        }),
                        scope: '#/properties/prefix',
                        type: 'Control',
                    },
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
            {
                elements: [
                    {
                        label: intl.formatMessage({
                            id: 'description.label',
                        }),
                        scope: '#/properties/description',
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
                    schema.properties.prefix.oneOf.length > 0 ? (
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
                                id={`${messagePrefix}.noAccessGrants`}
                            />
                        </Alert>
                    )
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
