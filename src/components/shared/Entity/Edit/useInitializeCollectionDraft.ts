import { createDraftSpec, getDraftSpecsByCatalogName } from 'api/draftSpecs';
import {
    getLiveSpecsByCatalogName,
    LiveSpecsExtQuery_ByCatalogName,
} from 'api/liveSpecsExt';
import {
    useBindingsEditorStore_setCollectionData,
    useBindingsEditorStore_setCollectionInitializationAlert,
    useBindingsEditorStore_setSchemaInferenceDisabled,
} from 'components/editor/Bindings/Store/hooks';
import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useCallback } from 'react';
import { Annotations } from 'types/jsonforms';

const specType = 'collection';

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

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();

    const updateBindingsEditorState = useCallback(
        (data: BindingsEditorState['collectionData']): void => {
            setCollectionData(data);

            if (data) {
                const writeSchemaKey = data.spec.hasOwnProperty('writeSchema')
                    ? 'writeSchema'
                    : 'schema';

                const inferenceAnnotationValue =
                    !data.spec[writeSchemaKey][Annotations.inferSchema];

                setSchemaInferenceDisabled(inferenceAnnotationValue);
            } else {
                setSchemaInferenceDisabled(false);
            }
        },
        [setCollectionData, setSchemaInferenceDisabled]
    );

    const getCollectionDraftSpecs = useCallback(
        async (
            collectionName: string,
            lastPubId?: string,
            liveSpec?: any
        ): Promise<void> => {
            if (draftId) {
                const draftSpecResponse = await getDraftSpecsByCatalogName(
                    draftId,
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
                    const newDraftSpecResponse = await createDraftSpec(
                        draftId,
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
                } else {
                    // The draft of a collection that has never been published could not be found.
                    updateBindingsEditorState(undefined);
                }
            }
        },
        [setCollectionInitializationAlert, updateBindingsEditorState, draftId]
    );

    return useCallback(
        async (collection: string): Promise<void> => {
            setCollectionInitializationAlert(null);

            if (collection) {
                const publishedCollection = await getCollection(collection);

                await getCollectionDraftSpecs(
                    collection,
                    publishedCollection?.last_pub_id,
                    publishedCollection?.spec
                );
            }
        },
        [getCollectionDraftSpecs, setCollectionInitializationAlert]
    );
}

export default useInitializeCollectionDraft;
