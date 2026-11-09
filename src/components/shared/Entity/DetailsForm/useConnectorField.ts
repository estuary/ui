import type { EntityWithCreateWorkflow } from 'src/types';

import { useMemo } from 'react';

import { CONNECTOR_IMAGE_SCOPE } from 'src/forms/renderers/Connectors';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { buildConnectorImageFromTag } from 'src/utils/connector-utils';

export default function useConnectorField(
    entityType: EntityWithCreateWorkflow
) {
    const connectorTag = useWorkflowStore((state) => state.connectorMetadata);

    const connectorsOneOf = useMemo(() => {
        if (!connectorTag) {
            return [];
        }

        return [
            {
                const: buildConnectorImageFromTag(connectorTag),
                title:
                    connectorTag.connector.title ??
                    connectorTag.connector.imageName,
            },
        ];
    }, [connectorTag]);

    const connectorSchema = useMemo(
        () => ({
            description: "The external system you're connecting to.",
            oneOf: connectorsOneOf,
            type: 'object',
        }),
        [connectorsOneOf]
    );

    const connectorUISchema = {
        label: 'Connector Search',
        scope: `#/properties/${CONNECTOR_IMAGE_SCOPE}`,
        type: 'Control',
        options: {
            readOnly: true,
        },
    };

    return { connectorSchema, connectorUISchema };
}
