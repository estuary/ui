import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import { DraftEditorStoreNames, useZustandStore } from 'context/Zustand';
import { CATALOG_NAME_SCOPE } from 'forms/renderers/CatalogName';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { entityCreateStoreSelectors } from 'stores/Create';
import { Grants } from 'types';

interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    accessGrants: Grants[];
    draftEditorStoreName: DraftEditorStoreNames;
}

function DetailsForm({
    connectorTags,
    accessGrants,
    draftEditorStoreName,
}: Props) {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const connectorID = searchParams.get(
        authenticatedRoutes.captures.create.params.connectorID
    );

    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >(draftEditorStoreName, (state) => state.isSaving);

    const useEntityCreateStore = useRouteStore();
    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );
    const formData = useEntityCreateStore(
        entityCreateStoreSelectors.details.data
    );
    const setDetails = useEntityCreateStore(
        entityCreateStoreSelectors.details.set
    );
    const displayValidation = useEntityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );
    const isActive = useEntityCreateStore(entityCreateStoreSelectors.isActive);

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
                        id: connector.connector_tags[0].id,
                        imagePath: `${connector.image_name}${connector.connector_tags[0].image_tag}`,
                        iconPath: connector.image,
                    },
                    title: connector.title,
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
                            id: 'entityCreate.connector.label',
                        }),
                        scope: `#/properties/${CONNECTOR_IMAGE_SCOPE}`,
                        type: 'Control',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'entityName.label',
                        }),
                        scope: `#/properties/${CATALOG_NAME_SCOPE}`,
                        type: 'Control',
                    },
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
            <Typography variant="h5" sx={{ mb: 1 }}>
                <FormattedMessage id={`${messagePrefix}.details.heading`} />
            </Typography>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id={`${messagePrefix}.instructions`} />
            </Typography>

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
                            readonly={isSaving || isActive}
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
