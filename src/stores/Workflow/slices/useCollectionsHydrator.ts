import type { CollectionMetadata } from 'src/stores/Workflow/slices/Collections';

import { useCallback, useMemo } from 'react';

import { getDraftSpecsBySpecTypeReduced } from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogNames } from 'src/api/liveSpecsExt';
import {
    useEditorStore_id,
    useEditorStore_liveBuiltSpec,
} from 'src/components/editor/Store/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

function useCollectionsHydrator() {
    // const isEdit = useEntityWorkflow_Editing();

    const draftId = useEditorStore_id();
    const liveBuiltSpec = useEditorStore_liveBuiltSpec();

    const initializeCollections = useWorkflowStore((state) => {
        return state.initializeCollections;
    });

    console.log('useCollectionsHydrator:draftId', draftId);
    console.log('useCollectionsHydrator:liveBuiltSpec', liveBuiltSpec);

    const collectionsNeedingFetched: string[] | null = useMemo(
        () =>
            liveBuiltSpec
                ? ([
                      ...new Set(
                          liveBuiltSpec.bindings.map(
                              ({ collection }: any) => collection.name
                          )
                      ),
                  ] as string[])
                : null,
        [liveBuiltSpec]
    );

    const hydrateCollections = useCallback(async () => {
        if (!collectionsNeedingFetched || !draftId) {
            return Promise.resolve();
        }

        const collectionsToAdd = new Map<string, CollectionMetadata>();

        const collectionsOnDraftSpecResponse =
            await getDraftSpecsBySpecTypeReduced(draftId, 'collection');

        if (collectionsOnDraftSpecResponse.error) {
            console.log('CollectionsHydrator FAILED');
            return Promise.reject();
        }

        if (
            collectionsOnDraftSpecResponse.data &&
            collectionsOnDraftSpecResponse.data.length > 0
        ) {
            collectionsOnDraftSpecResponse.data.forEach(
                ({ catalog_name, spec }) => {
                    collectionsToAdd.set(catalog_name, {
                        spec,
                        belongsToDraft: true,
                    });
                }
            );
        }

        const collectionsStillNeeded =
            collectionsToAdd.size === 0
                ? collectionsNeedingFetched
                : collectionsNeedingFetched.filter(
                      (collection) => !collectionsToAdd.has(collection)
                  );

        // We fetched what is on the draft now go fetch the live ones
        const liveCollections = await getLiveSpecsByCatalogNames(
            'collection',
            collectionsStillNeeded
        );

        if (liveCollections.error) {
            console.log('CollectionsHydrator FAILED');
            return Promise.reject();
        }

        if (liveCollections.data && liveCollections.data.length > 0) {
            liveCollections.data.forEach(({ catalog_name, spec }) => {
                collectionsToAdd.set(catalog_name, {
                    spec,
                    belongsToDraft: false,
                });
            });
        }

        initializeCollections(collectionsToAdd);

        return Promise.resolve();
    }, [collectionsNeedingFetched, draftId, initializeCollections]);

    return {
        hydrateCollections,
    };
}

export default useCollectionsHydrator;
