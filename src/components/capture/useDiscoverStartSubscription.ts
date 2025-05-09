import type { Entity } from 'src/types';

import { useCallback } from 'react';

import {
    useEditorStore_setDiscoveredDraftId,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { supabaseClient } from 'src/context/GlobalProviders';
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import useStoreDiscoveredCaptures from 'src/hooks/useStoreDiscoveredCaptures';
import { DEFAULT_FILTER, logRocketEvent } from 'src/services/shared';
import {
    DEFAULT_POLLER_ERROR,
    JOB_STATUS_POLLER_ERROR,
    TABLES,
} from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_setServerUpdateRequired,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

const trackEvent = (payload: any) => {
    logRocketEvent(CustomEvents.CAPTURE_DISCOVER, {
        name: payload.capture_name ?? DEFAULT_FILTER,
        id: payload.id ?? DEFAULT_FILTER,
        draft_id: payload.draft_id ?? DEFAULT_FILTER,
        logs_token: payload.logs_token ?? DEFAULT_FILTER,
        status: payload.job_status?.type ?? DEFAULT_FILTER,
    });
};

function useDiscoverStartSubscription(entityType: Entity) {
    const postGenerateMutate = useMutateDraftSpec();

    const { jobStatusPoller } = useJobStatusPoller();

    const { callFailed } = useEntityWorkflowHelpers();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();
    const setDiscoveredDraftId = useEditorStore_setDiscoveredDraftId();

    const setFormState = useFormStateStore_setFormState();

    const setDraftedEntityName = useDetailsFormStore(
        (state) => state.setDraftedEntityName
    );

    const setServerUpdateRequired = useEndpointConfig_setServerUpdateRequired();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    const storeDiscoveredCollections = useStoreDiscoveredCaptures();

    const jobFailed = useCallback(
        (error) => {
            setFormState({
                error,
                status: FormStatus.FAILED,
            });
        },
        [setFormState]
    );

    return useCallback(
        (
            discoverDraftId: string,
            existingEndpointConfig: any, // JsonFormsData
            skipUpdate?: boolean
        ) => {
            logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                newValue: 'defaulting-to-null',
                component: 'useDiscoverStartSubscription',
            });

            setDraftId(null);
            setDiscoveredDraftId(discoverDraftId);

            jobStatusPoller(
                supabaseClient
                    .from(TABLES.DISCOVERS)
                    .select(
                        `
                        capture_name,
                        draft_id,
                        job_status,
                        created_at
                    `
                    )
                    .match({
                        draft_id: discoverDraftId,
                    })
                    .order('created_at', { ascending: false }),
                async (payload: any) => {
                    await storeDiscoveredCollections(
                        payload.draft_id,
                        entityType,
                        callFailed,
                        skipUpdate
                    );

                    void postGenerateMutate();

                    setDraftedEntityName(payload.capture_name);

                    setPreviousEndpointConfig({ data: existingEndpointConfig });

                    setFormState({
                        status: FormStatus.GENERATED,
                    });

                    // We have ran a discover so we know the endpoint was able to be submitted
                    //  Should fix the issue called out here:
                    //      https://github.com/estuary/ui/pull/650#pullrequestreview-1466195898
                    setServerUpdateRequired(false);

                    trackEvent(payload);
                },
                (payload: any) => {
                    if (payload.error === JOB_STATUS_POLLER_ERROR) {
                        jobFailed(DEFAULT_POLLER_ERROR);
                    } else {
                        jobFailed({
                            title: 'discovery.failed.title',
                            error: {
                                message: 'discovery.failed.message',
                            },
                        });
                    }
                }
            );
        },
        [
            callFailed,
            entityType,
            jobFailed,
            jobStatusPoller,
            postGenerateMutate,
            setDiscoveredDraftId,
            setDraftId,
            setDraftedEntityName,
            setFormState,
            setPreviousEndpointConfig,
            setServerUpdateRequired,
            storeDiscoveredCollections,
        ]
    );
}

export default useDiscoverStartSubscription;
