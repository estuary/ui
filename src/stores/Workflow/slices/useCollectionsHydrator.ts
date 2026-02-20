import type { CollectionMetadata } from 'src/stores/Workflow/slices/Collections';

import { useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { getDraftSpecsBySpecTypeReduced } from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogNames } from 'src/api/liveSpecsExt';
import { logRocketEvent } from 'src/services/shared';
import { generateDefaultCollectionMetadata } from 'src/stores/Workflow/slices/Collections';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { hasOwnProperty } from 'src/utils/misc-utils';
import { getCollectionName } from 'src/utils/workflow-utils';

function useCollectionsHydrator() {
    const [
        collections,
        collectionsHydrating,
        initializeCollections,
        setCollectionsError,
        setCollectionsHydrating,
        collectionsInited,
    ] = useWorkflowStore(
        useShallow((state) => [
            state.collections,
            state.collectionsHydrating,
            state.initializeCollections,
            state.setCollectionsError,
            state.setCollectionsHydrating,
            state.collectionsInited,
        ])
    );

    return useCallback(
        async (id: string, specToUse: any) => {
            // If we are already hydrating then we can skip
            if (collectionsHydrating) {
                logRocketEvent('WorkflowStore', {
                    collections: true,
                    hydrating: 'skipped',
                    alreadyRunning: true,
                });
                return Promise.resolve();
            }

            // Go through the bindings and get the names we need to fetch
            const collectionsNeedingFetched = [
                ...new Set<string>(
                    specToUse?.bindings
                        ?.filter((binding: any) => {
                            return Boolean(!binding.disable);
                        })
                        .map((binding: any) => {
                            return getCollectionName(binding);
                        })
                        .filter((name: string) => {
                            // Filter out collections we already know about
                            return !hasOwnProperty(collections, name);
                        }) ?? []
                ),
            ];

            // Since this hook runs as the draft changes we need to see if
            //  there are any new collections for us to fetch. So if we are
            //  already `inited` only continue on if there are collections missing.
            if (collectionsInited && collectionsNeedingFetched.length === 0) {
                logRocketEvent('WorkflowStore', {
                    collections: true,
                    hydrating: 'skipped',
                    collectionsInited,
                    collectionsNeedingFetched: collectionsNeedingFetched.length,
                });
                return Promise.resolve();
            }

            // We have started running so set this.
            //  setting it back to `false` is handled by
            //  the store in the `init` and `error` functions
            setCollectionsHydrating(true);
            logRocketEvent('WorkflowStore', {
                collections: true,
                hydrating: 'running',
                collectionsNeedingFetched: collectionsNeedingFetched.length,
            });

            // Keep track of all the collections that need loaded into the workflow store
            const collectionsToAdd = new Map<string, CollectionMetadata>();

            if (id) {
                // Fetch all the collections already on the draft if we have a draft
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
        [
            collections,
            collectionsHydrating,
            collectionsInited,
            initializeCollections,
            setCollectionsError,
            setCollectionsHydrating,
        ]
    );
}

export default useCollectionsHydrator;
