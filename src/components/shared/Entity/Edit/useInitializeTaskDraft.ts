import { createEntityDraft, getDraftsByCatalogName } from 'api/drafts';
import { createDraftSpec, getDraftSpecsByCatalogName } from 'api/draftSpecs';
import {
    getLiveSpecsByCatalogName,
    getLiveSpecsByLiveSpecId,
    LiveSpecsExtQuery_ByLiveSpecId,
} from 'api/liveSpecsExt';
import {
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

const createTaskDraft = async (catalogName: string): Promise<string | null> => {
    const draftsResponse = await createEntityDraft(catalogName);

    if (draftsResponse.error) {
        console.log('createTaskDraft | drafts', draftsResponse.error);

        return null;
    } else if (draftsResponse.data && draftsResponse.data.length > 0) {
        return draftsResponse.data[0].id;
    } else {
        console.log('createTaskDraft | drafts | fall through');

        return null;
    }
};

function useInitializeTaskDraft() {
    const [connectorId, liveSpecId, lastPubId, draftIdInURL] =
        useGlobalSearchParams([
            GlobalSearchParams.CONNECTOR_ID,
            GlobalSearchParams.LIVE_SPEC_ID,
            GlobalSearchParams.LAST_PUB_ID,
            GlobalSearchParams.DRAFT_ID,
        ]);
    const navigateToEdit = useEntityEditNavigate();

    const taskSpecType = useEntityType();

    // Draft Editor Store
    // const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

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

            if (liveSpecResponse.error) {
                console.log(
                    'createTaskDraft | live specs',
                    liveSpecResponse.error
                );

                return null;
            } else if (
                liveSpecResponse.data &&
                liveSpecResponse.data.length > 0
            ) {
                return liveSpecResponse.data[0];
            } else {
                console.log('createTaskDraft | live specs | fall through');

                return null;
            }
        }, [liveSpecId, taskSpecType]);

    const getTaskDraft = useCallback(
        async ({
            catalog_name,
        }: LiveSpecsExtQuery_ByLiveSpecId): Promise<{
            evaluatedDraftId: string | null;
            draftSpecsMissing: boolean;
        }> => {
            const existingDraftsResponse = await getDraftsByCatalogName(
                catalog_name,
                true
            );

            // Checking for the existence of the draft ID in the URL is the key to forcing
            // the regeneration of a draft when a workflow is entered.
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
                    const expectedPubId =
                        existingDraftSpecsResponse.data[0].expect_pub_id;

                    const liveSpecResponse = await getLiveSpecsByCatalogName(
                        catalog_name,
                        taskSpecType
                    );

                    if (
                        liveSpecResponse.data &&
                        liveSpecResponse.data.length > 0 &&
                        expectedPubId === liveSpecResponse.data[0].last_pub_id
                    ) {
                        console.log('Use existing draft');
                        console.log(existingDraftId);

                        return {
                            evaluatedDraftId: existingDraftId,
                            draftSpecsMissing: false,
                        };
                    } else {
                        // Create new draft and draft specs.
                        console.log('Create a new draft');

                        const newDraftId = await createTaskDraft(catalog_name);

                        return {
                            evaluatedDraftId: newDraftId,
                            draftSpecsMissing: true,
                        };
                    }
                } else {
                    // Create new draft specs.
                    console.log('Existing draft spec response empty');

                    const newDraftId = await createTaskDraft(catalog_name);

                    return {
                        evaluatedDraftId: newDraftId,
                        draftSpecsMissing: true,
                    };
                }
            } else {
                // Create a new draft and draft specs.
                console.log('Existing draft response empty');

                const newDraftId = await createTaskDraft(catalog_name);

                return {
                    evaluatedDraftId: newDraftId,
                    draftSpecsMissing: true,
                };
            }
        },
        [draftIdInURL, taskSpecType]
    );

    const getTaskDraftSpecs = useCallback(
        async (
            evaluatedDraftId: string | null,
            { catalog_name, spec }: LiveSpecsExtQuery_ByLiveSpecId
        ) => {
            const draftSpecResponse = await createDraftSpec(
                evaluatedDraftId,
                catalog_name,
                spec,
                taskSpecType,
                lastPubId
            );

            if (draftSpecResponse.error) {
                console.log(
                    'getTaskDraftSpecs | draft specs | error',
                    draftSpecResponse.error
                );
            }
        },
        [lastPubId, taskSpecType]
    );

    return useCallback(
        async (
            setLoading: Dispatch<SetStateAction<boolean>>
        ): Promise<void> => {
            const task = await getTask();

            if (task) {
                const { evaluatedDraftId, draftSpecsMissing } =
                    await getTaskDraft(task);

                if (evaluatedDraftId) {
                    if (draftSpecsMissing) {
                        await getTaskDraftSpecs(evaluatedDraftId, task);
                    }

                    setDraftId(evaluatedDraftId);
                    setPersistedDraftId(evaluatedDraftId);

                    setFormState({ status: FormStatus.GENERATED });

                    setLoading(false);

                    navigateToEdit(
                        taskSpecType,
                        {
                            [GlobalSearchParams.CONNECTOR_ID]: connectorId,
                            [GlobalSearchParams.LIVE_SPEC_ID]: liveSpecId,
                            [GlobalSearchParams.LAST_PUB_ID]: lastPubId,
                        },
                        { [GlobalSearchParams.DRAFT_ID]: evaluatedDraftId },
                        true
                    );
                }
            }
        },
        [
            getTask,
            getTaskDraft,
            getTaskDraftSpecs,
            navigateToEdit,
            setDraftId,
            setFormState,
            setPersistedDraftId,
            connectorId,
            lastPubId,
            liveSpecId,
            taskSpecType,
        ]
    );
}

export default useInitializeTaskDraft;
