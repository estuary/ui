import { useEntityWorkflow_Editing } from 'context/Workflow';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useDetailsForm_changed_connectorId } from 'stores/DetailsForm/hooks';
import { Details } from 'stores/DetailsForm/types';
import { EntityWithCreateWorkflow } from 'types';
import { hasLength } from 'utils/misc-utils';
import {
    ConnectorVersionEvaluationOptions,
    evaluateConnectorVersions,
} from 'utils/workflow-utils';
import { MAC_ADDR_RE } from 'validation';
import useEntityCreateNavigate from '../hooks/useEntityCreateNavigate';
import { getConnectorImageDetails } from './Form';

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
    const connectorImagePath = useDetailsFormStore(
        (state) => state.details.data.connectorImage.imagePath
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
        if (!connectorImagePath) {
            return undefined;
        }

        const imageTagStartIndex = connectorImagePath.indexOf(':');
        return isEdit && hasLength(connectorId) && imageTagStartIndex > 0
            ? {
                  connectorId,
                  existingImageTag: connectorImagePath.substring(
                      imageTagStartIndex,
                      connectorImagePath.length
                  ),
              }
            : undefined;
    }, [connectorId, connectorImagePath, isEdit]);

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
        (
            details: Details,
            selectedDataPlaneId: string | undefined
        ): boolean => {
            const selectedConnectorId = details.data.connectorImage.connectorId;

            if (
                MAC_ADDR_RE.test(selectedConnectorId) &&
                selectedConnectorId !== originalConnectorImage.connectorId
            ) {
                if (selectedConnectorId === connectorId) {
                    setDetails_connector(details.data.connectorImage);
                } else {
                    setEntityNameChanged(details.data.entityName);

                    navigateToCreate(
                        entityType,
                        selectedConnectorId,
                        true,
                        true,
                        selectedDataPlaneId ?? null
                    );

                    return true;
                }
            }

            return false;
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
