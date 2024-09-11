import { useEntityWorkflow_Editing } from 'context/Workflow';
import { CATALOG_NAME_SCOPE } from 'forms/renderers/CatalogName';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { Details } from 'stores/DetailsForm/types';
import { EntityWithCreateWorkflow } from 'types';
import useConnectorField from './useConnectorField';
import useDataPlaneField from './useDataPlaneField';

export default function useFormFields(
    connectorTags: ConnectorWithTagDetailQuery[],
    entityType: EntityWithCreateWorkflow
) {
    const intl = useIntl();
    const isEdit = useEntityWorkflow_Editing();

    const setDetails = useDetailsFormStore((state) => state.setDetails);
    const setEntityNameChanged = useDetailsFormStore(
        (state) => state.setEntityNameChanged
    );
    const setDraftedEntityName = useDetailsFormStore(
        (state) => state.setDraftedEntityName
    );

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

    return { schema, uiSchema, updateDetails };
}
