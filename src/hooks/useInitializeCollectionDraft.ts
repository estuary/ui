import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, getDraftSpecsByCatalogName } from 'api/draftSpecs';
import {
    getLiveSpecsByCatalogName,
    LiveSpecsExtQuery_ByCatalogName,
} from 'api/liveSpecsExt';
import {
    useBindingsEditorStore_resetState,
    useBindingsEditorStore_setCollectionData,
    useBindingsEditorStore_setCollectionInitializationAlert,
    useBindingsEditorStore_setSchemaInferenceDisabled,
} from 'components/editor/Bindings/Store/hooks';
import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { Annotations } from 'types/jsonforms';
import { getProperSchemaScope } from 'utils/schema-utils';

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
    const setCollectionData = useBindingsEditorStore_setCollectionData();
    const setCollectionInitializationAlert =
        useBindingsEditorStore_setCollectionInitializationAlert();

    const setSchemaInferenceDisabled =
        useBindingsEditorStore_setSchemaInferenceDisabled();

    const resetBindingsEditorState = useBindingsEditorStore_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const setDraftId = useEditorStore_setId();

    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    const updateBindingsEditorState = useCallback(
        (data: BindingsEditorState['collectionData']): void => {
            setCollectionData(data);

            if (data && !isEmpty(data.spec)) {
                const [writeSchemaKey] = getProperSchemaScope(data.spec);

                const inferenceAnnotationValue =
                    !data.spec[writeSchemaKey][Annotations.inferSchema];

                setSchemaInferenceDisabled(inferenceAnnotationValue);
            } else {
                setSchemaInferenceDisabled(true);
            }
        },
        [setCollectionData, setSchemaInferenceDisabled]
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
                updateBindingsEditorState({
                    spec: newDraftSpecResponse.data[0].spec,
                    belongsToDraft: true,
                });
            } else {
                updateBindingsEditorState({
                    spec: liveSpec,
                    belongsToDraft: false,
                });

                setCollectionInitializationAlert({
                    severity: 'warning',
                    messageId:
                        'workflows.collectionSelector.error.message.draftCreationFailed',
                });
            }
        },
        [setCollectionInitializationAlert, updateBindingsEditorState]
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

                    updateBindingsEditorState({
                        spec: draftSpecResponse.data[0].spec,
                        belongsToDraft: true,
                    });

                    if (lastPubId && expectedPubId !== lastPubId) {
                        setCollectionInitializationAlert({
                            severity: 'warning',
                            messageId:
                                'workflows.collectionSelector.error.message.invalidPubId',
                        });
                    }

                    // TODO (optimization): When a diff editor with merge capabilities is available in the UI, present
                    //   the user with an option to review the "live" collection specification, merge in the desired
                    //   modifications, and update the expected pub ID of the draft to reflect the latest publication.

                    // if (!lastPubId || expectedPubId === lastPubId) {
                    //     updateBindingsEditorState({
                    //         spec: draftSpecResponse.data[0].spec,
                    //         belongsToDraft: true,
                    //     });
                    // } else {
                    //     const updatedDraftSpecResponse = await modifyDraftSpec(
                    //         draftSpecResponse.data[0].spec,
                    //         { draft_id: draftId, catalog_name: collectionName }
                    //     );

                    //     if (
                    //         updatedDraftSpecResponse.data &&
                    //         updatedDraftSpecResponse.data.length > 0
                    //     ) {
                    //         updateBindingsEditorState({
                    //             spec: updatedDraftSpecResponse.data[0].spec,
                    //             belongsToDraft: true,
                    //         });

                    //         setCollectionInitializationAlert({
                    //             severity: 'warning',
                    //             messageId:
                    //                 'workflows.collectionSelector.error.message.invalidPubId',
                    //         });
                    //     }
                    // }
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
                    updateBindingsEditorState(undefined);
                }
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

                setDraftId(newDraftId);
                setPersistedDraftId(newDraftId);
            }
        },
        [
            createCollectionDraftSpec,
            setCollectionInitializationAlert,
            setDraftId,
            setPersistedDraftId,
            updateBindingsEditorState,
        ]
    );

    return useCallback(
        async (collection: string): Promise<void> => {
            resetBindingsEditorState();

            if (collection) {
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
