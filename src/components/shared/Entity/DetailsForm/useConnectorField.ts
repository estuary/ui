import type { EntityWithCreateWorkflow } from 'src/types';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { CONNECTOR_IMAGE_SCOPE } from 'src/forms/renderers/Connectors';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { buildConnectorImageFromTag } from 'src/utils/connector-utils';

export default function useConnectorField(
    entityType: EntityWithCreateWorkflow
) {
    const intl = useIntl();

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
            description: intl.formatMessage({
                id: 'connector.description',
            }),
            oneOf: connectorsOneOf,
            type: 'object',
        }),
        [connectorsOneOf, intl]
    );

    const connectorUISchema = {
        label: intl.formatMessage({
            id: 'entityCreate.connector.label',
        }),
        scope: `#/properties/${CONNECTOR_IMAGE_SCOPE}`,
        type: 'Control',
        options: {
            readOnly: true,
        },
    };

    return { connectorSchema, connectorUISchema };
}
