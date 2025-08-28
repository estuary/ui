import type { PostgrestError } from '@supabase/postgrest-js';
import type { Dispatch, SetStateAction } from 'react';
import type { DraftSpecsExtQuery_ByCatalogName } from 'src/api/draftSpecs';
import type { LiveSpecsExtQuery_ByLiveSpecId } from 'src/api/liveSpecsExt';

import { useCallback } from 'react';

import { createEntityDraft, getDraftsByCatalogName } from 'src/api/drafts';
import {
    createDraftSpec,
    getDraftSpecsByCatalogName,
    modifyDraftSpec,
} from 'src/api/draftSpecs';
import { getLiveSpecsByLiveSpecId } from 'src/api/liveSpecsExt';
import {
    useEditorStore_resetState,
    useEditorStore_setCatalogName,
    useEditorStore_setDraftInitializationError,
    useEditorStore_setId,
    useEditorStore_setLiveBuiltSpec,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import useEntityEditNavigate from 'src/components/shared/Entity/hooks/useEntityEditNavigate';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

interface SupabaseConfig {
    createNew: boolean;
    spec: any;
}

const createTaskDraft = async (catalogName: string): Promise<string | null> => {
    const draftsResponse = await createEntityDraft(catalogName);

    return draftsResponse.data && draftsResponse.data.length > 0
        ? draftsResponse.data[0].id
        : null;
};

function useInitializeTaskDraft() {
    const [liveSpecId, draftIdInURL] = useGlobalSearchParams([
        GlobalSearchParams.LIVE_SPEC_ID,
        GlobalSearchParams.DRAFT_ID,
    ]);
    const prefillLiveSpecIds = useGlobalSearchParams(
        GlobalSearchParams.PREFILL_LIVE_SPEC_ID,
        true
    );
    const navigateToEdit = useEntityEditNavigate();

    const taskSpecType = useEntityType();

    // Draft Editor Store
    const resetState = useEditorStore_resetState();
    const setDraftId = useEditorStore_setId();
    const setDraftInitializationError =
        useEditorStore_setDraftInitializationError();
    const setCatalogName = useEditorStore_setCatalogName();
    const setLiveBuiltSpec = useEditorStore_setLiveBuiltSpec();

    // const persistedDraftId = useEditorStore_persistedDraftId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();

    // Get catalog name and task spec from live specs
    const getTask =
        useCallback(async (): Promise<LiveSpecsExtQuery_ByLiveSpecId | null> => {
            resetState();

            const liveSpecResponse = await getLiveSpecsByLiveSpecId(liveSpecId);

            if (liveSpecResponse.data && liveSpecResponse.data.length > 0) {
                setCatalogName(liveSpecResponse.data[0].catalog_name);
                setLiveBuiltSpec(liveSpecResponse.data[0].built_spec);

                return liveSpecResponse.data[0];
            } else {
                setDraftInitializationError({
                    severity: 'error',
                    messageId: 'workflows.initTask.alert.message.initFailed',
                });

                return null;
            }
        }, [
            liveSpecId,
            resetState,
            setCatalogName,
            setDraftInitializationError,
            setLiveBuiltSpec,
        ]);

    const getTaskDraft = useCallback(
        async ({
            catalog_name,
            spec,
        }: LiveSpecsExtQuery_ByLiveSpecId): Promise<{
            existingDraftSpecsResponse: DraftSpecsExtQuery_ByCatalogName | null;
            evaluatedDraftId: string | null;
            draftSpecsRequestConfig: SupabaseConfig | null;
        }> => {
            const existingDraftsResponse = await getDraftsByCatalogName(
                catalog_name,
                true
            );

            // Checking for the existence of the draft ID in the URL is the key to forcing
            // the regeneration of a draft when an edit workflow is entered.
            if (
                draftIdInURL &&
                existingDraftsResponse.data &&
                existingDraftsResponse.data.length > 0
            ) {
                const existingDraftId = existingDraftsResponse.data[0].id;

                const existingDraftSpecsResponse =
                    await getDraftSpecsByCatalogName(
                        existingDraftId,
                        catalog_name,
                        taskSpecType
                    );

                if (
                    existingDraftSpecsResponse.data &&
                    existingDraftSpecsResponse.data.length > 0
                ) {
                    return {
                        existingDraftSpecsResponse:
                            existingDraftSpecsResponse.data[0],
                        evaluatedDraftId: existingDraftId,
                        draftSpecsRequestConfig: null,
                    };

                    // TODO (optimization): Evaluate the expected pub ID of the drafted task and
                    //   provide the user with an option to merge in the spec changes to their draft
                    //   as well as update the expected pub ID.

                    // if (
                    //     existingDraftSpecsResponse.data[0].expect_pub_id ===
                    //     last_pub_id
                    // ) {
                    //     return {
                    //         evaluatedDraftId: existingDraftId,
                    //         draftSpecsRequestConfig: null,
                    //     };
                    // } else {
                    //     return {
                    //         evaluatedDraftId: existingDraftId,
                    //         draftSpecsRequestConfig: {
                    //             createNew: false,
                    //             spec: existingDraftSpecsResponse.data[0].spec,
                    //         },
                    //     };
                    // }
                } else {
                    setDraftInitializationError({
                        severity: 'warning',
                        messageId:
                            'workflows.initTask.alert.message.patchedSpec',
                    });

                    return {
                        existingDraftSpecsResponse: null,
                        evaluatedDraftId: existingDraftId,
                        draftSpecsRequestConfig: {
                            createNew: false,
                            spec,
                        },
                    };
                }
            } else {
                const newDraftId = await createTaskDraft(catalog_name);

                return {
                    existingDraftSpecsResponse: null,
                    evaluatedDraftId: newDraftId,
                    draftSpecsRequestConfig: { createNew: true, spec },
                };
            }
        },
        [setDraftInitializationError, draftIdInURL, taskSpecType]
    );

    const getTaskDraftSpecs = useCallback(
        async (
            evaluatedDraftId: string,
            draftSpecsRequestConfig: SupabaseConfig | null,
            { catalog_name, last_pub_id }: LiveSpecsExtQuery_ByLiveSpecId
        ): Promise<PostgrestError | null> => {
            if (draftSpecsRequestConfig) {
                const draftSpecResponse = draftSpecsRequestConfig.createNew
                    ? await createDraftSpec(
                          evaluatedDraftId,
                          catalog_name,
                          draftSpecsRequestConfig.spec,
                          taskSpecType,
                          last_pub_id
                      )
                    : await modifyDraftSpec(draftSpecsRequestConfig.spec, {
                          draft_id: evaluatedDraftId,
                          catalog_name,
                      });

                return draftSpecResponse.error ?? null;
            } else {
                return null;
            }
        },
        [taskSpecType]
    );

    const initializeTaskDraft = useCallback(
        async (
            setLoading: Dispatch<SetStateAction<boolean>>
        ): Promise<void> => {
            const task = await getTask();

            if (task) {
                const { evaluatedDraftId, draftSpecsRequestConfig } =
                    await getTaskDraft(task);

                if (evaluatedDraftId) {
                    // Force disabled materializations enabled. This way when a test is ran
                    //  there will not be an error and the backend will connect to the connector
                    const forceEnabled =
                        Boolean(task.spec?.shards?.disable) &&
                        taskSpecType === 'materialization';
                    if (forceEnabled) {
                        task.spec.shards.disable = false;
                    }

                    const draftSpecsError = await getTaskDraftSpecs(
                        evaluatedDraftId,
                        draftSpecsRequestConfig,
                        task
                    );

                    if (!draftSpecsError) {
                        logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                            newValue: evaluatedDraftId,
                            component: 'useInitializeTaskDraft',
                        });
                        setDraftId(evaluatedDraftId);
                        setPersistedDraftId(evaluatedDraftId);

                        setFormState({ status: FormStatus.GENERATED });

                        navigateToEdit(
                            taskSpecType,
                            {
                                [GlobalSearchParams.LIVE_SPEC_ID]: liveSpecId,
                                [GlobalSearchParams.CONNECTOR_ID]:
                                    task.connector_id,
                                [GlobalSearchParams.LAST_PUB_ID]:
                                    task.last_pub_id,
                            },
                            {
                                [GlobalSearchParams.PREFILL_LIVE_SPEC_ID]:
                                    prefillLiveSpecIds,
                                [GlobalSearchParams.DRAFT_ID]: evaluatedDraftId,
                                [GlobalSearchParams.FORCED_SHARD_ENABLE]:
                                    forceEnabled,
                            },
                            true
                        );
                    } else {
                        setDraftInitializationError({
                            severity: 'error',
                            messageId:
                                'workflows.initTask.alert.message.initFailed',
                        });
                    }
                } else {
                    setDraftInitializationError({
                        severity: 'error',
                        messageId:
                            'workflows.initTask.alert.message.initFailed',
                    });
                }
            }

            setLoading(false);
        },
        [
            getTask,
            getTaskDraft,
            getTaskDraftSpecs,
            liveSpecId,
            navigateToEdit,
            prefillLiveSpecIds,
            setDraftId,
            setDraftInitializationError,
            setFormState,
            setPersistedDraftId,
            taskSpecType,
        ]
    );

    return { initializeTaskDraft };
}

export default useInitializeTaskDraft;
