import type { EntityWithCreateWorkflow } from 'src/types';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { CONNECTOR_IMAGE_SCOPE } from 'src/forms/renderers/Connectors';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

const DEKAF_IMAGE_PREFIX = 'ghcr.io/estuary/dekaf-';

export default function useConnectorField(
    entityType: EntityWithCreateWorkflow
) {
    const intl = useIntl();

    const connectorTag = useWorkflowStore((state) => state.connectorMetadata);

    const connectorsOneOf = useMemo(() => {
        if (!connectorTag) {
            return [];
        }

        const {
            id,
            connectorId: connectorTagId,
            imageTag,
            connector,
        } = connectorTag;

        const base = {
            connectorId: connectorTagId,
            iconPath: connector.logoUrl ?? '',
            id,
            imageName: connector.imageName,
            imageTag,
        };

        const connectorImage = connector.imageName.startsWith(
            DEKAF_IMAGE_PREFIX
        )
            ? {
                  ...base,
                  variant: connector.imageName.substring(
                      DEKAF_IMAGE_PREFIX.length
                  ),
              }
            : { ...base, imagePath: `${connector.imageName}${imageTag}` };

        return [
            {
                const: connectorImage,
                title: connector.title ?? connector.imageName,
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
