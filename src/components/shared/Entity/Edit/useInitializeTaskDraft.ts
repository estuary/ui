import { PostgrestError } from '@supabase/postgrest-js';
import { createEntityDraft, getDraftsByCatalogName } from 'api/drafts';
import {
    createDraftSpec,
    getDraftSpecsByCatalogName,
    modifyDraftSpec,
} from 'api/draftSpecs';
import {
    getLiveSpecsByLiveSpecId,
    LiveSpecsExtQuery_ByLiveSpecId,
} from 'api/liveSpecsExt';
import {
    useEditorStore_setDraftInitializationError,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import useEntityEditNavigate from 'components/shared/Entity/hooks/useEntityEditNavigate';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

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
    const [connectorId, liveSpecId, draftIdInURL] = useGlobalSearchParams([
        GlobalSearchParams.CONNECTOR_ID,
        GlobalSearchParams.LIVE_SPEC_ID,
        GlobalSearchParams.DRAFT_ID,
    ]);
    const prefillPubIds = useGlobalSearchParams(
        GlobalSearchParams.PREFILL_PUB_ID,
        true
    );
    const navigateToEdit = useEntityEditNavigate();

    const taskSpecType = useEntityType();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();
    const setDraftInitializationError =
        useEditorStore_setDraftInitializationError();

    // const persistedDraftId = useEditorStore_persistedDraftId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();

    // Get catalog name and task spec from live specs
    const getTask =
        useCallback(async (): Promise<LiveSpecsExtQuery_ByLiveSpecId | null> => {
            const liveSpecResponse = await getLiveSpecsByLiveSpecId(
                liveSpecId,
                taskSpecType
            );

            if (liveSpecResponse.data && liveSpecResponse.data.length > 0) {
                return liveSpecResponse.data[0];
            } else {
                setDraftInitializationError({
                    severity: 'error',
                    messageId: 'workflows.initTask.alert.message.initFailed',
                });

                return null;
            }
        }, [setDraftInitializationError, liveSpecId, taskSpecType]);

    const getTaskDraft = useCallback(
        async ({
            catalog_name,
            spec,
        }: LiveSpecsExtQuery_ByLiveSpecId): Promise<{
            draftSpecsRequestConfig: SupabaseConfig | null;
            evaluatedDraftId: string | null;
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

    return useCallback(
        async (
            setLoading: Dispatch<SetStateAction<boolean>>
        ): Promise<void> => {
            const task = await getTask();

            if (task) {
                const { evaluatedDraftId, draftSpecsRequestConfig } =
                    await getTaskDraft(task);

                if (evaluatedDraftId) {
                    const draftSpecsError = await getTaskDraftSpecs(
                        evaluatedDraftId,
                        draftSpecsRequestConfig,
                        task
                    );

                    if (!draftSpecsError) {
                        setDraftId(evaluatedDraftId);
                        setPersistedDraftId(evaluatedDraftId);

                        setFormState({ status: FormStatus.GENERATED });

                        navigateToEdit(
                            taskSpecType,
                            {
                                [GlobalSearchParams.CONNECTOR_ID]: connectorId,
                                [GlobalSearchParams.LIVE_SPEC_ID]: liveSpecId,
                                [GlobalSearchParams.LAST_PUB_ID]:
                                    task.last_pub_id,
                            },
                            {
                                [GlobalSearchParams.PREFILL_PUB_ID]:
                                    prefillPubIds,
                                [GlobalSearchParams.DRAFT_ID]: evaluatedDraftId,
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
            navigateToEdit,
            setDraftId,
            setDraftInitializationError,
            setFormState,
            setPersistedDraftId,
            connectorId,
            liveSpecId,
            prefillPubIds,
            taskSpecType,
        ]
    );
}

export default useInitializeTaskDraft;
