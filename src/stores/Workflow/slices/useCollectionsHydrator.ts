import { useCallback } from 'react';

import { getDraftSpecsBySpecTypeReduced } from 'src/api/draftSpecs';

function useCollectionsHydrator() {
    const fetchDraftCollections = useCallback(async (draftId: string) => {
        // Look for every collection on the draft.
        const collectionsOnDraftSpecResponse =
            await getDraftSpecsBySpecTypeReduced(draftId, 'collection');
        if (collectionsOnDraftSpecResponse.error) {
            console.log('CollectionsHydrator FAILED');
            // onFailure({
            //     error: {
            //         title: 'captureEdit.generate.failedErrorTitle',
            //         error: collectionsOnDraftSpecResponse.error,
            //     },
            // });

            return false;
        }

        // We need to track what is already on the draft so we do not overwrite
        //  any changes the user made while we mark reset=true
        let collectionsOnDraft: string[] | null = null;
        if (
            collectionsOnDraftSpecResponse.data &&
            collectionsOnDraftSpecResponse.data.length > 0
        ) {
            // Get a list of all the collections on the draft spec.
            //  During create - this will often be all collections
            //  During edit - this will often only be the ones the user edited
            collectionsOnDraft = collectionsOnDraftSpecResponse.data.map(
                (datum) => datum.catalog_name
            );
        }

        return {
            collectionNamesOnDraft: collectionsOnDraft,
        };
    }, []);

    const hydrateCollections = useCallback(async () => {
        const response = await fetchDraftCollections('');

        console.log('response', response);
    }, [fetchDraftCollections]);

    return {
        hydrateCollections,
    };
}

export default useCollectionsHydrator;
