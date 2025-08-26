import type { Entity } from 'src/types';

import { useCallback } from 'react';

import { discover } from 'src/api/discovers';
import { createEntityDraft } from 'src/api/drafts';
import useDiscoverStartSubscription from 'src/components/capture/useDiscoverStartSubscription';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_setCatalogName,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore_endpointConfig_data } from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';

function useDiscoverStartDiscovery(entityType: Entity) {
    const createDiscoversSubscription =
        useDiscoverStartSubscription(entityType);
    const { callFailed } = useEntityWorkflowHelpers();

    const setDraftId = useEditorStore_setId();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const setCatalogName = useEditorStore_setCatalogName();

    const setFormState = useFormStateStore_setFormState();

    const imageConnectorTagId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );

    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();

    return useCallback(
        async (
            processedEntityName: string,
            encryptedEndpointConfigResponse: any,
            rediscover?: boolean,
            updateOnly?: boolean,
            dataPlaneName?: string
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
                updateOnly,
                dataPlaneName
            );

            if (discoverResponse.error) {
                logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                    newValue: 'defaulting-to-null',
                    component: 'useDiscoverStartDiscovery',
                });

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
            setDraftId,
            setFormState,
        ]
    );
}

export default useDiscoverStartDiscovery;
