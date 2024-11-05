import { useEntityWorkflow_Editing } from 'context/Workflow';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDetailsForm_changed_connectorId } from 'stores/DetailsForm/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { ConnectorMetadata, Details } from 'stores/DetailsForm/types';
import { EntityWithCreateWorkflow } from 'types';
import { hasLength } from 'utils/misc-utils';
import {
    ConnectorVersionEvaluationOptions,
    evaluateConnectorVersions,
} from 'utils/workflow-utils';
import { MAC_ADDR_RE } from 'validation';
import useEntityCreateNavigate from '../hooks/useEntityCreateNavigate';

// TODO (optimization): Consider deriving ConnectorWithTagDetailQuery and ConnectorsQuery_DetailsForm
//   from the same base interface so this function can be used in getConnectorImage.
const getConnectorImageDetails = (
    connector: ConnectorWithTagDetailQuery,
    options?: { connectorId: string; existingImageTag: string }
): Details['data']['connectorImage'] => {
    const connectorTag = evaluateConnectorVersions(connector, options);

    const { image_name } = connector;

    const connectorMetadata: ConnectorMetadata = {
        connectorId: connector.id,
        iconPath: connector.image,
        id: connectorTag.id,
        imageName: image_name,
        imageTag: connectorTag.image_tag,
    };

    return connectorTag.image_tag.includes(':dekaf')
        ? {
              ...connectorMetadata,
              variant: `${image_name}${connectorTag.image_tag}`,
          }
        : {
              ...connectorMetadata,
              imagePath: `${image_name}${connectorTag.image_tag}`,
          };
};

export default function useConnectorField(
    connectorTags: ConnectorWithTagDetailQuery[],
    entityType: EntityWithCreateWorkflow
) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const intl = useIntl();

    const navigateToCreate = useEntityCreateNavigate();
    const isEdit = useEntityWorkflow_Editing();

    const originalConnectorImage = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );
    const connectorImageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage.imageTag
    );
    const connectorIdChanged = useDetailsForm_changed_connectorId();
    const setDetails_connector = useDetailsFormStore(
        (state) => state.setDetails_connector
    );
    const setEntityNameChanged = useDetailsFormStore(
        (state) => state.setEntityNameChanged
    );

    useEffect(() => {
        if (connectorId && hasLength(connectorTags) && connectorIdChanged) {
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
    }, [setDetails_connector, connectorId, connectorIdChanged, connectorTags]);

    const versionEvaluationOptions:
        | ConnectorVersionEvaluationOptions
        | undefined = useMemo(() => {
        // This is rare but can happen so being safe.
        // If you remove the connector id from the create URL
        if (!connectorImageTag) {
            return undefined;
        }

        return isEdit && hasLength(connectorId)
            ? {
                  connectorId,
                  existingImageTag: connectorImageTag,
              }
            : undefined;
    }, [connectorId, connectorImageTag, isEdit]);

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
    };

    const evaluateConnector = useCallback(
        (details: Details, selectedDataPlaneId: string | undefined) => {
            const selectedConnectorId = details.data.connectorImage.connectorId;

            if (
                MAC_ADDR_RE.test(selectedConnectorId) &&
                selectedConnectorId !== originalConnectorImage.connectorId
            ) {
                if (selectedConnectorId === connectorId) {
                    setDetails_connector(details.data.connectorImage);
                } else {
                    setEntityNameChanged(details.data.entityName);

                    // TODO (data-plane): Set search param of interest instead of using navigate function.
                    navigateToCreate(
                        entityType,
                        selectedConnectorId,
                        true,
                        true,
                        selectedDataPlaneId ?? null
                    );
                }
            }
        },
        [
            connectorId,
            entityType,
            navigateToCreate,
            originalConnectorImage,
            setDetails_connector,
            setEntityNameChanged,
        ]
    );

    return { connectorSchema, connectorUISchema, evaluateConnector };
}
