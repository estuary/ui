import { createEntityDraft, getDraftsByCatalogName } from 'api/drafts';
import { createDraftSpec, getDraftSpecsByCatalogName } from 'api/draftSpecs';
import {
    getLiveSpecsByLiveSpecId,
    LiveSpecsExtQuery_ByLiveSpecId,
} from 'api/liveSpecsExt';
import {
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useEffect } from 'react';
import {
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { BaseComponentProps } from 'types';

function DraftInitializationGuard({ children }: BaseComponentProps) {
    const [liveSpecId, lastPubId] = useGlobalSearchParams([
        GlobalSearchParams.LIVE_SPEC_ID,
        GlobalSearchParams.LAST_PUB_ID,
    ]);

    const taskSpecType = useEntityType();

    // Draft Editor Store
    // const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    // const persistedDraftId = useEditorStore_persistedDraftId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    // Form State Store
    const formStatus = useFormStateStore_status();
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
        }: LiveSpecsExtQuery_ByLiveSpecId): Promise<string | null> => {
            // TODO (defect): Correct this initialization logic so that a new draft
            //   is not created when the browser is refreshed; evaluate whether a recent
            //   draft already exists and pull it if it does exist.

            // Try to find a draft with the given catalog name. If draft exists, check to see
            // if expected pub id for the task is valid. If draft does not exist, create new draft.
            const existingDraftsResponse = await getDraftsByCatalogName(
                catalog_name,
                true
            );

            if (
                existingDraftsResponse.data &&
                existingDraftsResponse.data.length > 0
            ) {
                // Evaluate existing pub ID for the existing task draft.
                const existingDraftId = existingDraftsResponse.data[0].id;

                const existingDraftSpecsResponse =
                    await getDraftSpecsByCatalogName(
                        existingDraftId,
                        catalog_name,
                        taskSpecType
                    );

                console.log(existingDraftSpecsResponse);
            }

            // If a draft exists and the expected pub id is not valid... what should be done. The
            // simplest path would be to create a new draft, but the user would lose all data. The
            // ideal path would be to keep existing draft but update all task info (and update
            // associated collections as needed, likely pruning if necessary).

            const draftsResponse = await createEntityDraft(catalog_name);

            if (draftsResponse.error) {
                console.log('getTaskDraft | drafts', draftsResponse.error);

                return null;
            } else if (draftsResponse.data && draftsResponse.data.length > 0) {
                return draftsResponse.data[0].id;
            } else {
                console.log('getTaskDraft | drafts | fall through');

                return null;
            }
        },
        [taskSpecType]
    );

    const getTaskDraftSpecs = useCallback(
        async (
            evaluatedDraftId: string | null,
            { catalog_name, spec }: LiveSpecsExtQuery_ByLiveSpecId
        ) => {
            if (evaluatedDraftId) {
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
            }
        },
        [lastPubId, taskSpecType]
    );

    const initializeDraftToEdit = useCallback(async (): Promise<void> => {
        const task = await getTask();

        if (task) {
            const evaluatedDraftId = await getTaskDraft(task);

            await getTaskDraftSpecs(evaluatedDraftId, task);

            setDraftId(evaluatedDraftId);
            setPersistedDraftId(evaluatedDraftId);

            setFormState({ status: FormStatus.GENERATED });
        }
    }, [
        getTask,
        getTaskDraftSpecs,
        setDraftId,
        setFormState,
        setPersistedDraftId,
    ]);

    useEffect(() => {
        if (formStatus === FormStatus.INIT) {
            void initializeDraftToEdit();
        }
    }, [initializeDraftToEdit, formStatus, lastPubId]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default DraftInitializationGuard;
