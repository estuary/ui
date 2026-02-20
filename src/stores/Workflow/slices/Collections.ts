import type { CollectionDef } from 'src/types/wasm';
import type { NamedSet } from 'zustand/middleware';

export interface CollectionMetadata {
    spec: CollectionDef | null;
    belongsToDraft: boolean;

    // TODO (schema edit?) this is a lot to transfer but should come over here
    // ui/src/components/editor/Bindings/Store/types.ts
    // Needs state machine status - NO BOOLEANS!
    // editor state
    // initAlert: any;
    // initComplete: boolean;
    // schemaUpdating: boolean;
    // schemaUpdated: boolean;
    // schemaUpdateErrored: boolean;

    // ui/src/stores/Binding/types.ts
    // Workflow State/meta
    // added?: boolean;
    // previouslyBound?: boolean;
    // sourceBackfillRecommended?: boolean;
    // trialStorage?: boolean;
    // updatedAt?: string;

    // Needed for useInitializeCollectionDraft
    // last_pub_id: any;
}

// More useful when we have a bigger object but leaving for now
export const generateDefaultCollectionMetadata = (
    definition: Partial<CollectionMetadata>
): CollectionMetadata => {
    return {
        spec: null,
        belongsToDraft: false,
        ...definition,
    };
};

interface CollectionDictionary {
    [collection: string]: CollectionMetadata;
}

export interface StoreWithCollections {
    collections: CollectionDictionary;
    // TODO (schema edit)
    //  this is NOT the name we want long term (99% sure of that). Making it this so
    //  it is easy to find when coming back and wiring edit up to this
    upsertCollection: (
        collectionName: string,
        meta: Partial<CollectionMetadata>
    ) => void;
    initializeCollections: (collections: Map<string, any>) => void;

    // Temporary before we implement a proper state machine pattern
    collectionsHydrating: boolean;
    setCollectionsHydrating: (newVal: boolean) => void;
    terminateCollectionHydration: () => void;

    collectionsError: boolean;
    setCollectionsError: (newVal: boolean) => void;
    collectionsInited: boolean;

    // TODO (schema edit)
    // Leaning towards this not being needed
    // removeCollections: (collection: string) => void;
}

export const getInitialCollectionData = (): Pick<
    StoreWithCollections,
    | 'collections'
    | 'collectionsError'
    | 'collectionsInited'
    | 'collectionsHydrating'
> => ({
    collections: {},
    collectionsError: false,
    collectionsHydrating: false,
    collectionsInited: false,
});

export const getStoreWithCollectionSettings = (
    set: NamedSet<StoreWithCollections>
): StoreWithCollections => ({
    ...getInitialCollectionData(),

    upsertCollection: (collection, meta) => {
        set(
            (state) => ({
                ...state,
                collections: {
                    ...state.collections,
                    [collection]: {
                        ...(state.collections[collection] ?? {}),
                        ...meta,
                    },
                },
            }),
            false,
            'upsertCollection'
        );
    },

    setCollectionsError: (collectionsError) => {
        set(
            (state) => ({
                ...state,
                collectionsError,
                collectionsHydrating: false,
            }),
            false,
            'setCollectionsError'
        );
    },

    setCollectionsHydrating: (collectionsHydrating) => {
        set(
            (state) => ({
                ...state,
                collectionsHydrating,
            }),
            false,
            'setCollectionsHydrating'
        );
    },

    initializeCollections: (collections) => {
        // Do not set 'inited' here as we can just return and assume
        //  we are still loading whatever we need
        if (collections.size < 1) {
            return;
        }

        set(
            (state) => ({
                ...state,
                collectionsInited: true,
                collectionsHydrating: false,
                collections: {
                    ...state.collections,
                    ...Object.fromEntries(collections),
                },
            }),
            false,
            'initializeCollections'
        );
    },

    // removeCollections: (name) => {
    //     set((state) => {
    //         return {
    //             ...state,
    //             collections: Object.fromEntries(
    //                 Object.entries(state.collections).filter(
    //                     ([key]) => !name.includes(key)
    //                 )
    //             ),
    //         };
    //     });
    // },

    terminateCollectionHydration: () => {
        set(
            (state) => ({
                ...state,
                collectionsInited: true,
                collectionsHydrating: false,
            }),
            false,
            'initializeCollections'
        );
    },
});
