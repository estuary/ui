import {
    createDraftSpec,
    getDraftSpecsByCatalogName,
    updateDraftSpec,
} from 'api/draftSpecs';
import {
    getLiveSpecsByCatalogName,
    LiveSpecsExtQuery_ByCatalogName,
} from 'api/liveSpecsExt';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useCallback } from 'react';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

type EvaluatedError = any | null;

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
    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const getCollectionDraftSpecs = useCallback(
        async ({
            catalog_name,
            spec,
            last_pub_id,
        }: LiveSpecsExtQuery_ByCatalogName): Promise<EvaluatedError> => {
            if (draftId) {
                const draftSpecResponse = await getDraftSpecsByCatalogName(
                    draftId,
                    catalog_name,
                    specType
                );

                if (draftSpecResponse.error) {
                    console.log(
                        'getCollectionDraft | draft specs',
                        draftSpecResponse.error
                    );

                    return draftSpecResponse.error;
                } else if (
                    draftSpecResponse.data &&
                    draftSpecResponse.data.length > 0
                ) {
                    const expectedPubId =
                        draftSpecResponse.data[0].expect_pub_id;

                    if (expectedPubId !== last_pub_id) {
                        console.log('Update existing draft spec entry');

                        const updatedDraftSpecResponse = await updateDraftSpec(
                            draftId,
                            catalog_name,
                            spec
                        );

                        if (updatedDraftSpecResponse.error) {
                            console.log(
                                'getCollectionDraftSpecs | draft specs | updated | error',
                                updatedDraftSpecResponse.error
                            );

                            return updatedDraftSpecResponse.error;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } else {
                    console.log('Create new draft spec entry');

                    const newDraftSpecResponse = await createDraftSpec(
                        draftId,
                        catalog_name,
                        spec,
                        specType,
                        last_pub_id
                    );

                    if (newDraftSpecResponse.error) {
                        console.log(
                            'getCollectionDraftSpecs | draft specs | new | error',
                            newDraftSpecResponse.error
                        );

                        return newDraftSpecResponse.error;
                    } else {
                        return null;
                    }
                }
            } else {
                return null;
            }
        },
        [draftId]
    );

    return useCallback(async (): Promise<EvaluatedError> => {
        if (currentCollection) {
            const { data: publishedCollection, error: liveSpecError } =
                await getCollection(currentCollection);

            if (liveSpecError) {
                return liveSpecError;
            } else if (publishedCollection) {
                const draftSpecError = await getCollectionDraftSpecs(
                    publishedCollection
                );

                return draftSpecError;
            } else {
                return 'Technical difficulties with collection draft initialization.';
            }
        } else {
            return 'Technical difficulties with collection draft initialization.';
        }
    }, [getCollectionDraftSpecs, currentCollection]);
}

export default useInitializeCollectionDraft;
