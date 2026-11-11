import { useCallback } from 'react';

import { usePostHog } from '@posthog/react';

import {
    useEditorStore_setDiscoveredDraftId,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useReloadDraftedTask } from 'src/components/shared/Entity/hooks/useReloadDraftedTask';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { useCreateDiscover } from 'src/hooks/discovers/useCreateDiscover';
import { usePollDiscover } from 'src/hooks/discovers/usePollDiscover';
import { logRocketEvent } from 'src/services/shared';
import {
    DEFAULT_POLLER_ERROR,
    JOB_STATUS_POLLER_ERROR,
} from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_setServerUpdateRequired,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

/**
 * Callback hook that starts a discover of the capture drafted in `draftId`.
 * Resolves to whether the discover started; it then runs in the background,
 * and once it succeeds the workflow is pointed at the discovered draft and
 * the form is marked generated.
 */
export function useStartDiscover() {
    const postHog = usePostHog();
    const { callFailed } = useEntityWorkflowHelpers();

    const createDiscover = useCreateDiscover();
    const watchDiscover = useWatchDiscover();

    const setDraftId = useEditorStore_setId();
    const setFormState = useFormStateStore_setFormState();

    const imageName = useDetailsFormStore(
        (state) => state.details.data.connectorImage.imageName
    );
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();

    return useCallback(
        async (
            draftId: string,
            catalogName: string,
            dataPlaneName?: string
        ) => {
            postHog.capture(CustomEvents.CAPTURE_DISCOVER, {
                status: 'init',
                imageName,
            });

            const { value: discover, error } = await createDiscover(
                draftId,
                catalogName,
                dataPlaneName
            );

            if (error) {
                logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                    newValue: 'defaulting-to-null',
                    component: 'useStartDiscover',
                });

                // If we failed at discovery we need to clear draft ID like we do
                //  when we watch the discover. Otherwise, the Test|Save
                //  buttons will appear.
                setDraftId(null);

                callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error,
                    },
                });

                return false;
            }

            void watchDiscover(draftId, endpointConfigData);

            setFormState({
                logToken: discover.logsToken,
            });

            return true;
        },
        [
            callFailed,
            createDiscover,
            endpointConfigData,
            imageName,
            postHog,
            setDraftId,
            setFormState,
            watchDiscover,
        ]
    );
}

// Callback hook that waits for a started discover to finish, then points the
// workflow at the discovered draft and marks the form generated
function useWatchDiscover() {
    const postHog = usePostHog();
    const { callFailed } = useEntityWorkflowHelpers();

    const pollDiscover = usePollDiscover();
    const reloadDraftedTask = useReloadDraftedTask();
    const postGenerateMutate = useMutateDraftSpec();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();
    const setDiscoveredDraftId = useEditorStore_setDiscoveredDraftId();

    const setFormState = useFormStateStore_setFormState();

    const setDraftedEntityName = useDetailsFormStore(
        (state) => state.setDraftedEntityName
    );

    // Endpoint Config Store
    const setServerUpdateRequired = useEndpointConfig_setServerUpdateRequired();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    const jobFailed = useCallback(
        (error: any) => {
            setFormState({
                error,
                status: FormStatus.FAILED,
            });
        },
        [setFormState]
    );

    return useCallback(
        async (
            discoverDraftId: string,
            existingEndpointConfig: any // JsonFormsData
        ) => {
            logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                newValue: 'defaulting-to-null',
                component: 'useWatchDiscover',
            });

            setDraftId(null);
            setDiscoveredDraftId(discoverDraftId);

            const { value, error } = await pollDiscover(discoverDraftId);
            const status = value?.job_status.type ?? error;
            postHog.capture(CustomEvents.CAPTURE_DISCOVER, { status });

            if (error === JOB_STATUS_POLLER_ERROR) {
                jobFailed(DEFAULT_POLLER_ERROR);
                return;
            }
            if (!value || error) {
                jobFailed({
                    title: 'discovery.failed.title',
                    error: {
                        message: 'discovery.failed.message',
                    },
                });
                return;
            }

            const { draft_id, capture_name } = value;
            const { error: reloadError } = await reloadDraftedTask(
                draft_id,
                capture_name
            );
            if (reloadError) {
                callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: reloadError,
                    },
                });
                return;
            }

            void postGenerateMutate();

            setDraftedEntityName(capture_name);
            setPreviousEndpointConfig({ data: existingEndpointConfig });
            setFormState({ status: FormStatus.GENERATED });

            // We have ran a discover so we know the endpoint was able to be submitted
            //  Should fix the issue called out here:
            //      https://github.com/estuary/ui/pull/650#pullrequestreview-1466195898
            setServerUpdateRequired(false);
        },
        [
            callFailed,
            jobFailed,
            pollDiscover,
            postGenerateMutate,
            postHog,
            reloadDraftedTask,
            setDiscoveredDraftId,
            setDraftId,
            setDraftedEntityName,
            setFormState,
            setPreviousEndpointConfig,
            setServerUpdateRequired,
        ]
    );
}
