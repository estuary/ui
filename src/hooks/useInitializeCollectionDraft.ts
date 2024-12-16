import { createEntityDraft } from 'api/drafts';
import {
    createDraftSpec,
    DraftSpecsExtQuery_ByCatalogName,
    getDraftSpecsByCatalogName,
} from 'api/draftSpecs';
import {
    getLiveSpecsByCatalogName,
    LiveSpecsExtQuery_ByCatalogName,
} from 'api/liveSpecsExt';
import { useBindingsEditorStore } from 'components/editor/Bindings/Store/create';
import {
    useBindingsEditorStore_resetState,
    useBindingsEditorStore_setCollectionData,
    useBindingsEditorStore_setCollectionInitializationAlert,
} from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { useCallback, useMemo } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';

const specType = 'collection';

const createGenericDraft = async (): Promise<string | null> => {
    const draftsResponse = await createEntityDraft('Created by the UI');

    return draftsResponse.data && draftsResponse.data.length > 0
        ? draftsResponse.data[0].id
        : null;
};

const getDraftSpecCollection = async (
    draftId: string,
    collectionName: string
): Promise<DraftSpecsExtQuery_ByCatalogName | null> => {
    const draftSpecResponse = await getDraftSpecsByCatalogName(
        draftId,
        collectionName,
        specType
    );

    if (draftSpecResponse.data && draftSpecResponse.data.length > 0) {
        return draftSpecResponse.data[0];
    } else {
        return null;
    }
};

const getLiveSpecCollection = async (
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
    const [setCollectionInitializationDone, setLatestLiveSpec] =
        useBindingsEditorStore((state) => [
            state.setCollectionInitializationDone,
            state.setLatestLiveSpec,
        ]);
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
                setCollectionData({
                    spec: newDraftSpecResponse.data[0].spec,
                    belongsToDraft: true,
                });

                setCollectionInitializationDone(true);
            } else {
                setCollectionData({
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
                    const expectedPubId =
                        draftSpecResponse.data[0].expect_pub_id;

                    setCollectionData({
                        spec: draftSpecResponse.data[0].spec,
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
            createCollectionDraftSpec,
            setCollectionData,
            setCollectionInitializationAlert,
            setCollectionInitializationDone,
            setDraftId,
            setLocalDraftId,
            setPersistedDraftId,
        ]
    );

    const getCurrentCollectionSpec = useCallback(
        async (
            collection: string,
            skipStoring?: boolean
        ): Promise<
            | LiveSpecsExtQuery_ByCatalogName
            | DraftSpecsExtQuery_ByCatalogName
            | null
        > => {
            resetBindingsEditorState(true);

            if (collection && draftId) {
                const draftCollection = await getDraftSpecCollection(
                    draftId,
                    collection
                );

                if (draftCollection) {
                    if (!skipStoring) {
                        setCollectionData({
                            spec: draftCollection.spec ?? null,
                            belongsToDraft: true,
                        });
                    }

                    return Promise.resolve(draftCollection);
                }

                // This need to first try fetching the collection from the draft
                //  that way if a user edits a collection, views another binding, and comes back
                //  they see their changes
                const publishedCollection = await getLiveSpecCollection(
                    collection
                );

                if (!skipStoring) {
                    setLatestLiveSpec(publishedCollection);
                    setCollectionData({
                        spec: publishedCollection?.spec ?? null,
                        belongsToDraft: false,
                    });
                }

                if (!publishedCollection) {
                    return Promise.reject(publishedCollection);
                }

                return Promise.resolve(publishedCollection);
            }

            return Promise.reject();
        },
        [
            draftId,
            resetBindingsEditorState,
            setCollectionData,
            setLatestLiveSpec,
        ]
    );

    const addCollectionToDraft = useCallback(
        async (collection: string): Promise<void> => {
            // resetBindingsEditorState(true);

            if (collection) {
                const publishedCollection = await getCurrentCollectionSpec(
                    collection,
                    true
                );

                // @ts-expect-error i'll fix this soon
                if (publishedCollection?.last_pub_id) {
                    await getCollectionDraftSpecs(
                        collection,
                        draftId,
                        // @ts-expect-error i'll fix this soon
                        publishedCollection.last_pub_id,
                        publishedCollection.spec
                    );
                }
            }
        },
        [
            // resetBindingsEditorState,
            getCurrentCollectionSpec,
            getCollectionDraftSpecs,
            draftId,
        ]
    );

    return useMemo(() => {
        return {
            getCurrentCollectionSpec,
            addCollectionToDraft,
        };
    }, [addCollectionToDraft, getCurrentCollectionSpec]);
}

export default useInitializeCollectionDraft;
