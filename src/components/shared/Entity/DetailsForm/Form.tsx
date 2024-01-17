import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, Stack, Typography } from '@mui/material';
import { useEditorStore_isSaving } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { Props } from 'components/shared/Entity/DetailsForm/types';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { CATALOG_NAME_SCOPE } from 'forms/renderers/CatalogName';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_connectorImage_imagePath,
    useDetailsForm_details,
    useDetailsForm_previousConnectorImage_connectorId,
    useDetailsForm_setDetails,
    useDetailsForm_setDetails_connector,
    useDetailsForm_setDraftedEntityName,
    useDetailsForm_setEntityNameChanged,
} from 'stores/DetailsForm/hooks';
import { Details } from 'stores/DetailsForm/types';
import {
    useFormStateStore_displayValidation,
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
} from 'stores/FormState/hooks';
import { hasLength } from 'utils/misc-utils';
import {
    ConnectorVersionEvaluationOptions,
    evaluateConnectorVersions,
} from 'utils/workflow-utils';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

export const getConnectorImageDetails = (
    connector: ConnectorWithTagDetailQuery,
    options?: { connectorId: string; existingImageTag: string }
): Details['data']['connectorImage'] => {
    const connectorTag = evaluateConnectorVersions(connector, options);

    return {
        connectorId: connector.id,
        id: connectorTag.id,
        imageName: connector.image_name,
        imagePath: `${connector.image_name}${connectorTag.image_tag}`,
        iconPath: connector.image,
    };
};

function DetailsFormForm({ connectorTags, entityType, readOnly }: Props) {
    const intl = useIntl();
    const navigateToCreate = useEntityCreateNavigate();
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    // Details Form Store
    const formData = useDetailsForm_details();
    const { connectorImage: originalConnectorImage } = formData;

    const currentConnectorId = useDetailsForm_connectorImage_connectorId();
    const currentConnectorImagePath = useDetailsForm_connectorImage_imagePath();
    const previousConnectorId =
        useDetailsForm_previousConnectorImage_connectorId();

    const setDetails = useDetailsForm_setDetails();
    const setDetails_connector = useDetailsForm_setDetails_connector();
    const setEntityNameChanged = useDetailsForm_setEntityNameChanged();
    const setDraftedEntityName = useDetailsForm_setDraftedEntityName();

    // Draft Editor Store
    const isSaving = useEditorStore_isSaving();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const displayValidation = useFormStateStore_displayValidation();

    const isActive = useFormStateStore_isActive();
    const isEdit = useEntityWorkflow_Editing();

    useEffect(() => {
        if (
            connectorId &&
            hasLength(connectorTags) &&
            currentConnectorId !== previousConnectorId
        ) {
            connectorTags.find((connector) => {
                const connectorTag = evaluateConnectorVersions(connector);

                const connectorLocated =
                    connectorTag.connector_id === connectorId;

                if (connectorLocated) {
                    setDetails_connector(getConnectorImageDetails(connector));
                }

                return connectorLocated;
            });
        }
    }, [
        setDetails_connector,
        connectorId,
        connectorTags,
        currentConnectorId,
        previousConnectorId,
    ]);

    const versionEvaluationOptions:
        | ConnectorVersionEvaluationOptions
        | undefined = useMemo(() => {
        const imageTagStartIndex = currentConnectorImagePath.indexOf(':');

        return isEdit && hasLength(currentConnectorId) && imageTagStartIndex > 0
            ? {
                  connectorId: currentConnectorId,
                  existingImageTag: currentConnectorImagePath.substring(
                      imageTagStartIndex,
                      currentConnectorImagePath.length
                  ),
              }
            : undefined;
    }, [currentConnectorId, currentConnectorImagePath, isEdit]);

    const connectorsOneOf = useMemo(() => {
        const response = [] as { title: string; const: Object }[];

        if (connectorTags.length > 0) {
            connectorTags.forEach((connector) => {
                response.push({
                    const: getConnectorImageDetails(
                        connector,
                        versionEvaluationOptions
                    ),
                    title: connector.title,
                });
            });
        }

        return response;
    }, [connectorTags, versionEvaluationOptions]);

    const schema = useMemo(() => {
        return {
            properties: {
                [CATALOG_NAME_SCOPE]: { type: 'string' },
                [CONNECTOR_IMAGE_SCOPE]: {
                    description: intl.formatMessage({
                        id: 'connector.description',
                    }),
                    oneOf: connectorsOneOf,
                    type: 'object',
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
    }, [connectorsOneOf, intl]);

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
            details.data.connectorImage.connectorId &&
            details.data.connectorImage.connectorId.length === 23 &&
            details.data.connectorImage.connectorId !==
                originalConnectorImage.connectorId
        ) {
            if (details.data.connectorImage.connectorId === connectorId) {
                setDetails_connector(details.data.connectorImage);
            } else {
                // Set the details before navigating to reduce "flicker"
                setDetails(details);
                setEntityNameChanged(details.data.entityName);

                navigateToCreate(
                    entityType,
                    details.data.connectorImage.connectorId,
                    true,
                    true
                );
            }
        } else {
            setDetails(details);

            // For edit we can set the Drafted Enity Name because the store sets the name
            //  and then set the entityNameChanged flag to false. Then we can reference
            //  the previous version to not lose settings (ex: bindings for Materialization)
            // For create we set the entity name changed flag so we can keep an eye
            //  on if the name has changed and we need to run "generate" again
            if (isEdit) {
                setDraftedEntityName(details.data.entityName);
            } else {
                setEntityNameChanged(details.data.entityName);
            }
        }
    };

    return (
        <>
            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id={`${messagePrefix}.instructions`} />
            </Typography>

            {readOnly ? (
                <Box sx={{ mb: 2 }}>
                    <AlertBox short severity="info">
                        {intl.formatMessage({
                            id: 'entityEdit.alert.detailsFormDisabled',
                        })}
                    </AlertBox>
                </Box>
            ) : null}

            <Stack direction="row" spacing={2}>
                {schema.properties[CONNECTOR_IMAGE_SCOPE].oneOf.length > 0 ? (
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
                    <AlertBox severity="warning" short>
                        <FormattedMessage
                            id={`${messagePrefix}.missingConnectors`}
                        />
                    </AlertBox>
                )}
            </Stack>
        </>
    );
}

export default DetailsFormForm;
