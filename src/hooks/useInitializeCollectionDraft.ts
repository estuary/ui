import type { LiveSpecsExtQuery_ByCatalogName } from 'src/api/liveSpecsExt';

import { useCallback } from 'react';

import { createEntityDraft } from 'src/api/drafts';
import {
    createDraftSpec,
    getDraftSpecsByCatalogName,
} from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'src/api/liveSpecsExt';
import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import {
    useBindingsEditorStore_resetState,
    useBindingsEditorStore_setCollectionData,
    useBindingsEditorStore_setCollectionInitializationAlert,
} from 'src/components/editor/Bindings/Store/hooks';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

const specType = 'collection';

const createGenericDraft = async (): Promise<string | null> => {
    const draftsResponse = await createEntityDraft('Created by the UI');

    return draftsResponse.data && draftsResponse.data.length > 0
        ? draftsResponse.data[0].id
        : null;
};

const getCollection = async (
    collectionName: string
): Promise<LiveSpecsExtQuery_ByCatalogName | null> => {
    const liveSpecResponse = await getLiveSpecsByCatalogName(
        collectionName,
        specType
    );

    if (liveSpecResponse.data && liveSpecResponse.data.length > 0) {
        return liveSpecResponse.data[0];
    } else {
        return null;
    }
};

function useInitializeCollectionDraft() {
    // Bindings Editor Store
    const setCollectionInitializationDone = useBindingsEditorStore(
        (state) => state.setCollectionInitializationDone
    );
    const setCollectionData = useBindingsEditorStore_setCollectionData();
    const setCollectionInitializationAlert =
        useBindingsEditorStore_setCollectionInitializationAlert();

    const resetBindingsEditorState = useBindingsEditorStore_resetState();

    // Global Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const setDraftId = useEditorStore_setId();

    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    // Local Draft Editor Store
    const setLocalDraftId = useEditorStore_setId({ localScope: true });

    // Workflow Store
    const [initializeProjections, upsertCollection] = useWorkflowStore(
        (state) => [state.initializeProjections, state.upsertCollection]
    );

    const createCollectionDraftSpec = useCallback(
        async (
            collectionName: string,
            evaluatedDraftId: string,
            lastPubId?: string,
            liveSpec?: any
        ) => {
            const newDraftSpecResponse = await createDraftSpec(
                evaluatedDraftId,
                collectionName,
                liveSpec,
                specType,
                lastPubId
            );

            if (
                newDraftSpecResponse.data &&
                newDraftSpecResponse.data.length > 0
            ) {
                const targetRow = newDraftSpecResponse.data[0];

                logRocketEvent(CustomEvents.PROJECTION, {
                    collection: collectionName,
                    operation: 'initialize',
                });
                logRocketConsole(`${CustomEvents.PROJECTION}:init:success`, {
                    belongsToDraft: true,
                    draftId: evaluatedDraftId,
                    projectionsExist: Boolean(targetRow.spec?.projections),
                });

                setCollectionData({
                    spec: targetRow.spec,
                    belongsToDraft: true,
                });
                initializeProjections(
                    targetRow.spec?.projections,
                    collectionName
                );
                upsertCollection(targetRow.catalog_name, {
                    spec: targetRow.spec,
                    belongsToDraft: true,
                });

                setCollectionInitializationDone(true);
            } else {
                logRocketEvent(CustomEvents.PROJECTION, {
                    collection: collectionName,
                    operation: 'initialize',
                });
                logRocketConsole(`${CustomEvents.PROJECTION}:init:success`, {
                    belongsToDraft: false,
                    draftId: evaluatedDraftId,
                    projectionsExist: Boolean(liveSpec?.projections),
                });

                setCollectionData({
                    spec: liveSpec,
                    belongsToDraft: false,
                });
                initializeProjections(liveSpec?.projections, collectionName);
                upsertCollection(collectionName, {
                    spec: liveSpec,
                    belongsToDraft: false,
                });

                setCollectionInitializationDone(false);
                setCollectionInitializationAlert({
                    severity: 'warning',
                    messageId:
                        'workflows.collectionSelector.error.message.draftCreationFailed',
                });
            }
        },
        [
            upsertCollection,
            initializeProjections,
            setCollectionData,
            setCollectionInitializationAlert,
            setCollectionInitializationDone,
        ]
    );

    const getCollectionDraftSpecs = useCallback(
        async (
            collectionName: string,
            existingDraftId: string | null,
            lastPubId?: string,
            liveSpec?: any
        ): Promise<void> => {
            if (existingDraftId) {
                const draftSpecResponse = await getDraftSpecsByCatalogName(
                    existingDraftId,
                    collectionName,
                    specType
                );

                if (
                    draftSpecResponse.data &&
                    draftSpecResponse.data.length > 0
                ) {
                    const targetRow = draftSpecResponse.data[0];

                    logRocketEvent(CustomEvents.PROJECTION, {
                        collection: collectionName,
                        operation: 'initialize',
                    });
                    logRocketConsole(
                        `${CustomEvents.PROJECTION}:init:success`,
                        {
                            belongsToDraft: true,
                            draftId: existingDraftId,
                            projectionsExist: Boolean(
                                targetRow.spec?.projections
                            ),
                        }
                    );

                    const expectedPubId = targetRow.expect_pub_id;

                    setCollectionData({
                        spec: targetRow.spec,
                        belongsToDraft: true,
                    });
                    initializeProjections(
                        targetRow.spec?.projections,
                        collectionName
                    );
                    upsertCollection(targetRow.catalog_name, {
                        spec: targetRow.spec,
                        belongsToDraft: true,
                    });

                    if (lastPubId && expectedPubId !== lastPubId) {
                        setCollectionInitializationDone(false);
                        setCollectionInitializationAlert({
                            severity: 'warning',
                            messageId:
                                'workflows.collectionSelector.error.message.invalidPubId',
                        });
                    }
                } else if (liveSpec) {
                    // The draft of a collection that has been published could not be found.
                    await createCollectionDraftSpec(
                        collectionName,
                        existingDraftId,
                        lastPubId,
                        liveSpec
                    );
                } else {
                    // The draft of a collection that has never been published could not be found.
                    setCollectionData(undefined);
                }

                setLocalDraftId(existingDraftId);
            } else {
                // A draft for the entity could not be found. Current scenarios(s): entering the
                // materialization create workflow and attempting to edit a collection specification
                // before the generate button is clicked. This CTA is traditionally responsible for
                // creating the draft of a task.
                const newDraftId = await createGenericDraft();

                if (newDraftId) {
                    await createCollectionDraftSpec(
                        collectionName,
                        newDraftId,
                        lastPubId,
                        liveSpec
                    );
                }

                logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                    newValue: newDraftId,
                    component: 'useInitializeCollectionDraft',
                });

                setLocalDraftId(newDraftId);
                setDraftId(newDraftId);
                setPersistedDraftId(newDraftId);
            }
        },
        [
            upsertCollection,
            createCollectionDraftSpec,
            initializeProjections,
            setCollectionData,
            setCollectionInitializationAlert,
            setCollectionInitializationDone,
            setDraftId,
            setLocalDraftId,
            setPersistedDraftId,
        ]
    );

    return useCallback(
        async (collection: string): Promise<void> => {
            resetBindingsEditorState(true);

            if (collection) {
                // TODO (infer)
                // Need to move more collection meta data and fetch off the workflow store
                const publishedCollection = await getCollection(collection);

                await getCollectionDraftSpecs(
                    collection,
                    draftId,
                    publishedCollection?.last_pub_id,
                    publishedCollection?.spec
                );
            }
        },
        [getCollectionDraftSpecs, resetBindingsEditorState, draftId]
    );
}

export default useInitializeCollectionDraft;
