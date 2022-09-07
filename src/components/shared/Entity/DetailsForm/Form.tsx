import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Stack, Typography } from '@mui/material';
import { globalSearchParams } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import { Props } from 'components/shared/Entity/DetailsForm/types';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import { useZustandStore } from 'context/Zustand';
import { CATALOG_NAME_SCOPE } from 'forms/renderers/CatalogName';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import useGlobalSearchParams from 'hooks/searchParams/useGlobalSearchParams';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import {
    Details,
    useDetailsForm_details,
    useDetailsForm_setDetails,
    useDetailsForm_setDetails_connector,
} from 'stores/DetailsForm';
import { EntityFormState } from 'stores/FormState';
import { hasLength } from 'utils/misc-utils';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

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

function DetailsFormForm({
    connectorTags,
    accessGrants,
    draftEditorStoreName,
    formStateStoreName,
    entityType,
    readOnly,
}: Props) {
    const intl = useIntl();
    const navigateToCreate = useEntityCreateNavigate();
    const connectorId = useGlobalSearchParams(globalSearchParams.connectorId);

    // Details Form Store
    const formData = useDetailsForm_details();
    const { connectorImage: originalConnectorImage } = formData;

    const setDetails = useDetailsForm_setDetails();
    const setDetails_connector = useDetailsForm_setDetails_connector();

    // Draft Editor Store
    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >(draftEditorStoreName, (state) => state.isSaving);

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

    useEffect(() => {
        if (connectorId && hasLength(connectorTags)) {
            connectorTags.find((connector) => {
                const response = connector.connector_tags[0].id === connectorId;
                if (response) {
                    setDetails_connector(getConnectorImageDetails(connector));
                }
                return response;
            });
        }
    }, [connectorId, connectorTags, setDetails_connector]);

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
        if (
            // TODO (Validators) we need to build out validators for specific types of data
            details.data.connectorImage.id &&
            details.data.connectorImage.id.length === 23 &&
            details.data.connectorImage.id !== originalConnectorImage.id
        ) {
            if (details.data.connectorImage.id === connectorId) {
                setDetails_connector(details.data.connectorImage);
            } else {
                // Set the details before navigating to reduce "flicker"
                setDetails(details);
                navigateToCreate(
                    entityType,
                    details.data.connectorImage.id,
                    true
                );
            }
        } else {
            setDetails(details);
        }
    };

    return (
        <>
            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id={`${messagePrefix}.instructions`} />
            </Typography>

            {readOnly ? (
                <Alert color="info" style={{ marginBottom: 8 }}>
                    {intl.formatMessage({
                        id: 'entityEdit.alert.detailsFormDisabled',
                    })}
                </Alert>
            ) : null}

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
                            readonly={readOnly ?? (isSaving || isActive)}
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

export default DetailsFormForm;
