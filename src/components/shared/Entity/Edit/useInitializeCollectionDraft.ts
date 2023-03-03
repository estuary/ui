import {
    createDraftSpec,
    getDraftSpecsByCatalogName,
    updateDraftSpec,
} from 'api/draftSpecs';
import {
    getLiveSpecsByCatalogName,
    LiveSpecsExtQuery_ByCatalogName,
} from 'api/liveSpecsExt';
import {
    useBindingsEditorStore_setCollectionData,
    useBindingsEditorStore_setCollectionInitializationError,
    useBindingsEditorStore_setSchemaInferenceDisabled,
} from 'components/editor/Bindings/Store/hooks';
import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useCallback } from 'react';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';
import { Annotations } from 'types/jsonforms';

type SupabaseResponse<T> =
    | { data: T; error?: undefined }
    | { data: null; error: any };

const specType = 'collection';

const getCollection = async (
    collectionName: string
): Promise<SupabaseResponse<LiveSpecsExtQuery_ByCatalogName>> => {
    const liveSpecResponse = await getLiveSpecsByCatalogName(
        collectionName,
        specType
    );

    if (liveSpecResponse.error) {
        console.log(
            'getPublishedCollection | live specs',
            liveSpecResponse.error
        );

        return { data: null, error: liveSpecResponse.error };
    } else if (liveSpecResponse.data && liveSpecResponse.data.length > 0) {
        return { data: liveSpecResponse.data[0] };
    } else {
        console.log('getPublishedCollection | live specs | fall through');

        return { data: null, error: liveSpecResponse.error };
    }
};

function useInitializeCollectionDraft() {
    // Bindings Editor Store
    const setCollectionData = useBindingsEditorStore_setCollectionData();
    const setCollectionInitializationError =
        useBindingsEditorStore_setCollectionInitializationError();

    const setSchemaInferenceDisabled =
        useBindingsEditorStore_setSchemaInferenceDisabled();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

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
            spec?: any
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

                    if (lastPubId && expectedPubId !== lastPubId) {
                        console.log('Update existing draft spec entry');

                        const updatedDraftSpecResponse = await updateDraftSpec(
                            draftId,
                            collectionName,
                            draftSpecResponse.data[0].spec
                        );

                        if (
                            updatedDraftSpecResponse.data &&
                            updatedDraftSpecResponse.data.length > 0
                        ) {
                            updateBindingsEditorState({
                                spec: updatedDraftSpecResponse.data[0].spec,
                                belongsToDraft: true,
                            });
                        } else {
                            updateBindingsEditorState({
                                spec: draftSpecResponse.data[0].spec,
                                belongsToDraft: true,
                            });

                            setCollectionInitializationError({
                                severity: 'warning',
                                messageId:
                                    'workflows.collectionSelector.error.message.invalidPubId',
                            });
                        }
                    } else {
                        updateBindingsEditorState({
                            spec: draftSpecResponse.data[0].spec,
                            belongsToDraft: true,
                        });
                    }
                } else if (spec) {
                    console.log('Create new draft spec entry');

                    const newDraftSpecResponse = await createDraftSpec(
                        draftId,
                        collectionName,
                        spec,
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
                            spec,
                            belongsToDraft: false,
                        });

                        setCollectionInitializationError({
                            severity: 'warning',
                            messageId:
                                'workflows.collectionSelector.error.message.draftCreationFailed',
                        });
                    }
                } else {
                    // The draft of a collection that has never been published could not be found.
                }
            }
        },
        [setCollectionInitializationError, updateBindingsEditorState, draftId]
    );

    return useCallback(async (): Promise<void> => {
        setCollectionInitializationError(null);

        if (currentCollection) {
            const { data: publishedCollection, error: liveSpecError } =
                await getCollection(currentCollection);

            if (liveSpecError) {
                return liveSpecError;
            } else {
                const draftSpecError = await getCollectionDraftSpecs(
                    currentCollection,
                    publishedCollection?.last_pub_id,
                    publishedCollection?.spec
                );

                return draftSpecError;
            }
        }
    }, [
        getCollectionDraftSpecs,
        setCollectionInitializationError,
        currentCollection,
    ]);
}

export default useInitializeCollectionDraft;
