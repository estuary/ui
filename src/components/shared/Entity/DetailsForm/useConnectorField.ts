import type { Details } from 'src/stores/DetailsForm/types';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useCallback, useMemo } from 'react';

import { useIntl } from 'react-intl';

import useEntityCreateNavigate from 'src/components/shared/Entity/hooks/useEntityCreateNavigate';
import { CONNECTOR_IMAGE_SCOPE } from 'src/forms/renderers/Connectors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { hasLength } from 'src/utils/misc-utils';

const DEKAF_IMAGE_PREFIX = 'ghcr.io/estuary/dekaf-';

export default function useConnectorField(
    entityType: EntityWithCreateWorkflow
) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const intl = useIntl();

    const navigateToCreate = useEntityCreateNavigate();

    const setEntityNameChanged = useDetailsFormStore(
        (state) => state.setEntityNameChanged
    );

    const connectorTag = useWorkflowStore((state) => state.connectorMetadata);

    const connectorsOneOf = useMemo(() => {
        if (!connectorTag) {
            return [];
        }

        const { id, connectorId: tagConnectorId, imageTag, connector } =
            connectorTag;

        const base = {
            connectorId: tagConnectorId,
            iconPath: connector.logoUrl ?? '',
            id,
            imageName: connector.imageName,
            imageTag,
        };

        const connectorImage = connector.imageName.startsWith(DEKAF_IMAGE_PREFIX)
            ? {
                  ...base,
                  variant: connector.imageName.substring(
                      DEKAF_IMAGE_PREFIX.length
                  ),
              }
            : { ...base, imagePath: `${connector.imageName}${imageTag}` };

        return [{ const: connectorImage, title: connector.title ?? connector.imageName }];
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

    const setConnector = useCallback(
        (details: Details, selectedDataPlaneId: string | undefined) => {
            if (!hasLength(connectorId)) {
                return;
            }

            setEntityNameChanged(details.data.entityName);

            navigateToCreate(entityType, {
                id: connectorId,
                advanceToForm: true,
                dataPlaneId: selectedDataPlaneId ?? null,
            });
        },
        [connectorId, entityType, navigateToCreate, setEntityNameChanged]
    );

    return { connectorSchema, connectorUISchema, setConnector };
}
