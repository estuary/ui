import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, Stack, Typography } from '@mui/material';
import { useEditorStore_isSaving } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { Props } from 'components/shared/Entity/DetailsForm/types';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { CATALOG_NAME_SCOPE } from 'forms/renderers/CatalogName';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { Details } from 'stores/DetailsForm/types';
import {
    useFormStateStore_displayValidation,
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
} from 'stores/FormState/hooks';
import { evaluateConnectorVersions } from 'utils/workflow-utils';
import useConnectorField from './useConnectorField';
import useDataPlaneField from './useDataPlaneField';

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

    // Details Form Store
    const formData = useDetailsFormStore((state) => state.details.data);

    const setDetails = useDetailsFormStore((state) => state.setDetails);
    const setEntityNameChanged = useDetailsFormStore(
        (state) => state.setEntityNameChanged
    );
    const setDraftedEntityName = useDetailsFormStore(
        (state) => state.setDraftedEntityName
    );

    // Draft Editor Store
    const isSaving = useEditorStore_isSaving();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const displayValidation = useFormStateStore_displayValidation();

    const isActive = useFormStateStore_isActive();
    const isEdit = useEntityWorkflow_Editing();

    const { connectorSchema, connectorUISchema, evaluateConnector } =
        useConnectorField(connectorTags, entityType);

    const { dataPlaneSchema, dataPlaneUISchema, evaluateDataPlane } =
        useDataPlaneField(entityType);

    const schema = useMemo(() => {
        const baseProperties = {
            [CATALOG_NAME_SCOPE]: { type: 'string' },
            [CONNECTOR_IMAGE_SCOPE]: connectorSchema,
            description: {
                description: intl.formatMessage({
                    id: 'description.description',
                }),
                type: 'string',
            },
        };

        const baseRequirements = [CATALOG_NAME_SCOPE, CONNECTOR_IMAGE_SCOPE];

        return dataPlaneSchema
            ? {
                  properties: {
                      ...baseProperties,
                      ...dataPlaneSchema,
                  },
                  required: baseRequirements.concat('dataPlane'),
                  type: 'object',
              }
            : {
                  properties: baseProperties,
                  required: baseRequirements,
                  type: 'object',
              };
    }, [connectorSchema, dataPlaneSchema, intl]);

    const uiSchema = useMemo(() => {
        const catalogNameUISchema = {
            label: intl.formatMessage({
                id: 'entityName.label',
            }),
            scope: `#/properties/${CATALOG_NAME_SCOPE}`,
            type: 'Control',
        };

        const descriptionUISchema = {
            label: intl.formatMessage({
                id: 'description.label',
            }),
            scope: '#/properties/description',
            type: 'Control',
        };

        return {
            elements: [
                {
                    elements: dataPlaneUISchema
                        ? [
                              connectorUISchema,
                              catalogNameUISchema,
                              dataPlaneUISchema,
                              descriptionUISchema,
                          ]
                        : [
                              connectorUISchema,
                              catalogNameUISchema,
                              descriptionUISchema,
                          ],
                    type: 'HorizontalLayout',
                },
            ],
            type: 'VerticalLayout',
        };
    }, [connectorUISchema, dataPlaneUISchema, intl]);

    const updateDetails = (details: Details) => {
        const selectedDataPlaneId = details.data.dataPlane?.id;

        evaluateDataPlane(details, selectedDataPlaneId);
        evaluateConnector(details, selectedDataPlaneId);

        setDetails(details);

        // For edit we can set the Drafted Entity Name because the store sets the name
        //  and then set the entityNameChanged flag to false. Then we can reference
        //  the previous version to not lose settings (ex: bindings for Materialization)
        // For create we set the entity name changed flag so we can keep an eye
        //  on if the name has changed and we need to run "generate" again
        if (isEdit) {
            setDraftedEntityName(details.data.entityName);
        } else {
            setEntityNameChanged(details.data.entityName);
        }
    };

    return (
        <>
            {readOnly ? (
                <Box sx={{ mb: 2, maxWidth: 'fit-content' }}>
                    <AlertBox short severity="info">
                        {intl.formatMessage({
                            id: 'entityEdit.alert.detailsFormDisabled',
                        })}
                    </AlertBox>
                </Box>
            ) : null}

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id={`${messagePrefix}.instructions`} />
            </Typography>

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
