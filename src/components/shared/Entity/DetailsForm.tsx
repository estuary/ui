import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Stack, Typography } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import { ConnectorTag } from 'components/shared/Entity/query';
import { CATALOG_NAME_SCOPE } from 'forms/renderers/CatalogName';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { createStoreSelectors, FormStatus } from 'stores/Create';
import { getStore } from 'stores/Repo';
import { Grants } from 'types';
import { getConnectorName } from 'utils/misc-utils';

interface Props {
    connectorTags: ConnectorTag[];
    accessGrants: Grants[];
    messagePrefix: 'materializationCreation' | 'captureCreation';
}

function DetailsForm({ connectorTags, messagePrefix, accessGrants }: Props) {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const connectorID = searchParams.get(
        routeDetails.captures.create.params.connectorID
    );

    const entityCreateStore = getStore(useRouteStore());
    const formData = entityCreateStore(createStoreSelectors.details.data);
    const setDetails = entityCreateStore(createStoreSelectors.details.set);
    const displayValidation = entityCreateStore(
        createStoreSelectors.formState.displayValidation
    );
    const status = entityCreateStore(createStoreSelectors.formState.status);

    useEffect(() => {
        if (connectorID) {
            setDetails({
                data: {
                    entityName: '',
                    connectorImage: {
                        id: connectorID,
                        iconPath: '',
                    },
                },
            });
        }
    }, [connectorID, setDetails]);

    const accessGrantsOneOf = useMemo(() => {
        const response = [] as string[];

        if (accessGrants.length > 0) {
            accessGrants.forEach((accessGrant) => {
                response.push(accessGrant.object_role);
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
                [CONNECTOR_IMAGE_SCOPE]: {
                    description: intl.formatMessage({
                        id: 'connector.description',
                    }),
                    oneOf: connectorsOneOf,
                    type: 'object',
                },
                [CATALOG_NAME_SCOPE]: {
                    description: intl.formatMessage({
                        id: 'entityName.description',
                    }),

                    // This pattern needs to match https://github.com/estuary/animated-carnival/blob/main/supabase/migrations/03_catalog-types.sql
                    //     as close as possible. We just alter it to handle that we know the list of allowed prefix values
                    //     this means that it handles the first portion of the name.
                    // `^([a-zA-Z0-9-_.]+/)+[a-zA-Z0-9-_.]+$`
                    examples: accessGrantsOneOf,
                    type: 'string',
                    pattern: `^(${accessGrantsOneOf.join(
                        '|'
                    )})([a-zA-Z0-9-_.]+/)*[a-zA-Z0-9-_.]+$`,
                },
                description: {
                    description: intl.formatMessage({
                        id: 'description.description',
                    }),
                    type: 'string',
                },
            },
            required: [CATALOG_NAME_SCOPE, CONNECTOR_IMAGE_SCOPE],
            type: 'object',
        };
    }, [accessGrantsOneOf, connectorsOneOf, intl]);

    const uiSchema = {
        elements: [
            {
                elements: [
                    {
                        label: intl.formatMessage({
                            id: 'entityName.label',
                        }),
                        scope: `#/properties/${CATALOG_NAME_SCOPE}`,
                        type: 'Control',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'connector.label',
                        }),
                        scope: `#/properties/${CONNECTOR_IMAGE_SCOPE}`,
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
                {schema.properties[CONNECTOR_IMAGE_SCOPE].oneOf.length > 0 ? (
                    schema.properties[CATALOG_NAME_SCOPE].examples.length >
                    0 ? (
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
