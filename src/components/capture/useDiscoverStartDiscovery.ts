import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';

import {
    useEditorStore_persistedDraftId,
    useEditorStore_setCatalogName,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useCallback } from 'react';
import { useDetailsForm_connectorImage_id } from 'stores/DetailsForm/hooks';
import { useEndpointConfigStore_endpointConfig_data } from 'stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';

import { Entity } from 'types';
import useDiscoverStartSubscription from './useDiscoverStartSubscription';

function useDiscoverStartDiscovery(entityType: Entity) {
    const createDiscoversSubscription =
        useDiscoverStartSubscription(entityType);
    const { callFailed } = useEntityWorkflowHelpers();

    const setDraftId = useEditorStore_setId();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const setCatalogName = useEditorStore_setCatalogName();

    const setFormState = useFormStateStore_setFormState();

    const imageConnectorTagId = useDetailsForm_connectorImage_id();

    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();

    return useCallback(
        async (
            processedEntityName: string,
            encryptedEndpointConfigResponse: any,
            rediscover?: boolean
        ) => {
            // If we are doing a rediscovery and we have a draft then go ahead and use that draft
            //  that way the most recent changes to bindings and endpoints will get added to the draft before rediscovery
            // This seems to be what users are expecting to happen.
            const updateBeforeRediscovery = Boolean(
                persistedDraftId && rediscover
            );

            const draftsResponse = updateBeforeRediscovery
                ? { data: [{ id: persistedDraftId }] }
                : await createEntityDraft(processedEntityName);

            if (draftsResponse.error) {
                callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: draftsResponse.error,
                    },
                });

                return false;
            }

            setCatalogName(processedEntityName);

            const newDraftId = draftsResponse.data[0].id;

            const discoverResponse = await discover(
                processedEntityName,
                encryptedEndpointConfigResponse,
                imageConnectorTagId,
                newDraftId,
                rediscover
            );

            if (discoverResponse.error) {
                // If we failed at discovery we need to clear draft ID like we do
                //  when we createDiscoversSubscription. Otherwise, the Test|Save
                //  buttons will appear.
                setDraftId(null);

                callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: discoverResponse.error,
                    },
                });

                return false;
            }
            createDiscoversSubscription(
                newDraftId,
                endpointConfigData,
                updateBeforeRediscovery
            );

            setFormState({
                logToken: discoverResponse.data[0].logs_token,
            });

            return true;
        },
        [
            callFailed,
            createDiscoversSubscription,
            endpointConfigData,
            imageConnectorTagId,
            persistedDraftId,
            setCatalogName,
            setFormState,
        ]
    );
}

export default useDiscoverStartDiscovery;
