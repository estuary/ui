import type { CollectionMetadata } from 'src/stores/Workflow/slices/Collections';

import { useCallback } from 'react';

import { getDraftSpecsBySpecTypeReduced } from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogNames } from 'src/api/liveSpecsExt';
import { generateDefaultCollectionMetadata } from 'src/stores/Workflow/slices/Collections';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { getCollectionName } from 'src/utils/workflow-utils';

function useCollectionsHydrator() {
    const [initializeCollections, setCollectionsError] = useWorkflowStore(
        (state) => {
            return [state.initializeCollections, state.setCollectionsError];
        }
    );

    const hydrateCollections = useCallback(
        async (id: string, specToUse: any) => {
            // Go through the bindings and get the names we need to fetch
            const collectionsNeedingFetched = [
                ...new Set<string>(
                    specToUse.bindings
                        .filter((binding: any) => {
                            return Boolean(!binding.disable);
                        })
                        .map((binding: any) => {
                            return getCollectionName(binding);
                        })
                ),
            ];

            // Keep track of all the collections that need loaded into the workflow store
            const collectionsToAdd = new Map<string, CollectionMetadata>();

            if (id) {
                // Fetch all the collections already on the draft
                const collectionsOnDraftSpecResponse =
                    await getDraftSpecsBySpecTypeReduced(id, 'collection');

                if (collectionsOnDraftSpecResponse.error) {
                    setCollectionsError(true);
                    return Promise.reject();
                }

                if (
                    collectionsOnDraftSpecResponse.data &&
                    collectionsOnDraftSpecResponse.data.length > 0
                ) {
                    collectionsOnDraftSpecResponse.data.forEach(
                        ({ catalog_name, spec }) => {
                            collectionsToAdd.set(
                                catalog_name,
                                generateDefaultCollectionMetadata({
                                    spec,
                                    belongsToDraft: true,
                                })
                            );
                        }
                    );
                }
            }

            // User might not have edited all the collections
            const collectionsStillNeeded =
                collectionsToAdd.size === 0
                    ? collectionsNeedingFetched
                    : collectionsNeedingFetched.filter(
                          (collection) => !collectionsToAdd.has(collection)
                      );

            // Now fetch the left overs from live_specs
            const liveCollections = await getLiveSpecsByCatalogNames(
                'collection',
                collectionsStillNeeded
            );

            if (liveCollections.error) {
                setCollectionsError(true);
                return Promise.reject();
            }

            if (liveCollections.data && liveCollections.data.length > 0) {
                liveCollections.data.forEach(({ catalog_name, spec }) => {
                    collectionsToAdd.set(
                        catalog_name,
                        generateDefaultCollectionMetadata({
                            spec,
                            belongsToDraft: false,
                        })
                    );
                });
            }

            // Store the collections we've fetched into WorkFlow
            initializeCollections(collectionsToAdd);

            return Promise.resolve();
        },
        [initializeCollections, setCollectionsError]
    );

    return {
        hydrateCollections,
    };
}

export default useCollectionsHydrator;
