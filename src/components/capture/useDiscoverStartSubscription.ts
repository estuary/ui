import {
    useEditorStore_setDiscoveredDraftId,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import { useMutateDraftSpec } from 'components/shared/Entity/MutateDraftSpecContext';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import useStoreDiscoveredCaptures from 'hooks/useStoreDiscoveredCaptures';
import { useCallback } from 'react';
import { DEFAULT_FILTER, logRocketEvent } from 'services/shared';
import {
    DEFAULT_POLLER_ERROR,
    JOB_STATUS_POLLER_ERROR,
    TABLES,
} from 'services/supabase';
import { CustomEvents } from 'services/types';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import {
    useEndpointConfigStore_setPreviousEndpointConfig,
    useEndpointConfig_setServerUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { Entity } from 'types';
import { supabaseClient } from 'context/GlobalProviders';

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
                newValue: null,
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
