import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { CATALOG_NAME_SCOPE } from 'src/forms/renderers/CatalogName';
import { CONNECTOR_IMAGE_SCOPE } from 'src/forms/renderers/Connectors';
import type { ConnectorWithTagDetailQuery } from 'src/hooks/connectors/shared';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import type { Details } from 'src/stores/DetailsForm/types';
import type { EntityWithCreateWorkflow } from 'src/types';
import useConnectorField from 'src/components/shared/Entity/DetailsForm/useConnectorField';
import useDataPlaneField from 'src/components/shared/Entity/DetailsForm/useDataPlaneField';

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

    const schema = useMemo(
        () => ({
            properties: {
                [CATALOG_NAME_SCOPE]: { type: 'string' },
                [CONNECTOR_IMAGE_SCOPE]: connectorSchema,
                ...dataPlaneSchema,
            },
            required: [CATALOG_NAME_SCOPE, CONNECTOR_IMAGE_SCOPE],
            type: 'object',
        }),
        [connectorSchema, dataPlaneSchema]
    );

    const uiSchema = useMemo(() => {
        const catalogNameUISchema = {
            label: intl.formatMessage({
                id: 'entityName.label',
            }),
            scope: `#/properties/${CATALOG_NAME_SCOPE}`,
            type: 'Control',
        };

        return {
            elements: [
                {
                    elements: [
                        connectorUISchema,
                        catalogNameUISchema,
                        dataPlaneUISchema,
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
