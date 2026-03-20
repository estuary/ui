import type { Details } from 'src/stores/DetailsForm/types';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useCallback, useMemo } from 'react';

import { useIntl } from 'react-intl';

import useEntityCreateNavigate from 'src/components/shared/Entity/hooks/useEntityCreateNavigate';
import { CONNECTOR_IMAGE_SCOPE } from 'src/forms/renderers/Connectors';
import useGlobalSearchParams from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export default function useConnectorField(
    entityType: EntityWithCreateWorkflow
) {
    const connectorImage = useGlobalSearchParams('connector_image');

    const intl = useIntl();

    const navigateToCreate = useEntityCreateNavigate();

    const setEntityNameChanged = useDetailsFormStore(
        (state) => state.setEntityNameChanged
    );

    const connectorTags = useWorkflowStore((state) => state.connectorMetadata);

    const connectorsOneOf = useMemo(() => {
        if (!connectorTags) {
            return [];
        }

        const DEKAF_IMAGE_PREFIX = 'ghcr.io/estuary/dekaf-';
        const { imageTag, connector } = connectorTags;
        const base = {
            iconPath: connector.logoUrl ?? '',
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

        return [{ const: connectorImage, title: connector.imageName }];
    }, [connectorTags]);

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

    const setConnector = useCallback(
        (details: Details, selectedDataPlaneId: string | undefined) => {
            setEntityNameChanged(details.data.entityName);

            // TODO (data-plane): Set search param of interest instead of using navigate function.
            navigateToCreate(entityType, {
                connectorImage,
                advanceToForm: true,
                dataPlaneId: selectedDataPlaneId ?? null,
            });
        },
        [connectorImage, entityType, navigateToCreate, setEntityNameChanged]
    );

    return { connectorSchema, connectorUISchema, setConnector };
}
