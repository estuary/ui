import type { CollectionMetadata } from 'src/stores/Workflow/slices/Collections';

import { useCallback, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { getDraftSpecsBySpecTypeReduced } from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogNames } from 'src/api/liveSpecsExt';
import { logRocketEvent } from 'src/services/shared';
import { generateDefaultCollectionMetadata } from 'src/stores/Workflow/slices/Collections';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { hasOwnProperty } from 'src/utils/misc-utils';
import { getCollectionName } from 'src/utils/workflow-utils';

function useCollectionsHydrator() {
    const isHydratingRef = useRef(false);

    const [
        collections,
        collectionsError,
        initializeCollections,
        setCollectionsError,
        collectionsInited,
    ] = useWorkflowStore(
        useShallow((state) => {
            return [
                state.collections,
                state.collectionsError,
                state.initializeCollections,
                state.setCollectionsError,
                state.collectionsInited,
            ];
        })
    );

    return useCallback(
        async (id: string, specToUse: any) => {
            if (
                // We are already in the process of hydrating so we should skip.
                isHydratingRef.current ||
                // A previous hydration attempt errored. Do not keep retrying as this
                //  would cause an infinite loop since collectionsInited is set on
                //  error but unfetched collections would still appear in collectionsNeedingFetched.
                collectionsError ||
                // This MUST be here to make initializeCollections act correctly
                // We have no spec to even try to find out the bindings we need to populate
                //  collection live specs for. We should skip.
                !specToUse
            ) {
                logRocketEvent('WorkflowStore', {
                    alreadyRunning: isHydratingRef.current,
                    collectionsError,
                    hydrating: 'skipped',
                    specExists: Boolean(specToUse),
                });
                return;
            }

            // Marking as hydrating right away so we do not potentially get duplicates
            isHydratingRef.current = true;

            try {
                // Go through the bindings and get the names we need to fetch
                //  Do not worry about fetching `disabled` collections so we don't
                //  fetch a ton of data we do not need right away. If a user enables
                //  the binding later we will come back through this flow and detect
                //  we need to populate it
                const collectionsNeedingFetched = [
                    ...new Set<string>(
                        specToUse.bindings
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

                const collectionsNeedingFetchedCount =
                    collectionsNeedingFetched.length;

                // Since this hook runs each time the draft changes, we need to check
                // whether there are new collection live specifications to fetch.
                if (collectionsInited && collectionsNeedingFetchedCount === 0) {
                    logRocketEvent('WorkflowStore', {
                        hydrating: 'skipped',
                        collectionsInited,
                        collectionsNeedingFetchedCount,
                    });

                    return;
                }

                // Now we are _truly_ hydrating so log it as we're about to start fetching data
                logRocketEvent('WorkflowStore', {
                    hydrating: 'running',
                    collectionsInited,
                    collectionsNeedingFetchedCount,
                });

                // Keep track of all the collections that need loaded into the workflow store
                const collectionsToAdd = new Map<string, CollectionMetadata>();

                if (id) {
                    // Fetch all the collections already on the draft if we have a draft
                    const collectionsOnDraftSpecResponse =
                        await getDraftSpecsBySpecTypeReduced(id, 'collection');

                    if (collectionsOnDraftSpecResponse.error) {
                        setCollectionsError(true);
                        throw new Error(
                            'Failed reading collections from draft'
                        );
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
                    throw new Error('Failed reading live specs of collections');
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
            } finally {
                // ALWAYS need to turn this off when we're done no matter what
                isHydratingRef.current = false;
            }
        },
        [
            collections,
            collectionsError,
            collectionsInited,
            initializeCollections,
            setCollectionsError,
        ]
    );
}

export default useCollectionsHydrator;
