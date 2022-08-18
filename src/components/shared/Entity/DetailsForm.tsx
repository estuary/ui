import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import {
    DraftEditorStoreNames,
    FormStateStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { CATALOG_NAME_SCOPE } from 'forms/renderers/CatalogName';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import {
    Details,
    useDetailsForm_details,
    useDetailsForm_setDetails,
} from 'stores/DetailsForm';
import { useEndpointConfigStore_reset } from 'stores/EndpointConfig';
import { EntityFormState } from 'stores/FormState';
import { Grants } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    accessGrants: Grants[];
    draftEditorStoreName: DraftEditorStoreNames;
    formStateStoreName: FormStateStoreNames;
    readOnly?: boolean;
}

export const getConnectorImageDetails = (
    connector: ConnectorWithTagDetailQuery
) => {
    return {
        connectorId: connector.id,
        id: connector.connector_tags[0].id,
        imagePath: `${connector.image_name}${connector.connector_tags[0].image_tag}`,
        iconPath: connector.image,
    };
};

function DetailsForm({
    connectorTags,
    accessGrants,
    draftEditorStoreName,
    formStateStoreName,
    readOnly = false,
}: Props) {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const connectorID =
        searchParams.get(
            authenticatedRoutes.captures.create.params.connectorID
        ) ??
        searchParams.get(
            authenticatedRoutes.materializations.create.params.connectorId
        );

    // Details Form Store
    const formData = useDetailsForm_details();
    const { connectorImage: originalConnectorImage } = formData;

    const setDetails = useDetailsForm_setDetails();

    // Draft Editor Store
    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >(draftEditorStoreName, (state) => state.isSaving);

    // Endpoint Config Store
    const resetEndpointConfig = useEndpointConfigStore_reset();

    // Form State Store
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const displayValidation = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['displayValidation']
    >(formStateStoreName, (state) => state.formState.displayValidation);

    const isActive = useZustandStore<
        EntityFormState,
        EntityFormState['isActive']
    >(formStateStoreName, (state) => state.isActive);

    const resetFormState = useZustandStore<
        EntityFormState,
        EntityFormState['resetState']
    >(formStateStoreName, (state) => state.resetState);

    useEffect(() => {
        if (connectorID && hasLength(connectorTags)) {
            connectorTags.forEach((connector) => {
                if (connector.connector_tags[0].id === connectorID) {
                    setDetails({
                        data: {
                            entityName: '',
                            connectorImage: getConnectorImageDetails(connector),
                        },
                    });
                }
            });
        }
    }, [setDetails, connectorID, connectorTags]);

    useEffect(() => {
        if (connectorID && originalConnectorImage.id !== connectorID) {
            resetFormState();
        }
    }, [resetFormState, connectorID, originalConnectorImage]);

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
                    const: getConnectorImageDetails(connector),
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

    const updateDetails = (details: Details) => {
        if (details.data.connectorImage.id === '') {
            resetEndpointConfig();
        }
        setDetails(details);
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
                            readonly={readOnly || isSaving || isActive}
                            validationMode={showValidation(displayValidation)}
                            onChange={updateDetails}
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
