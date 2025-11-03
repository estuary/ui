import type { NamedSet } from 'zustand/middleware';

export interface CollectionMetadata {
    spec: any;
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
    upsertCollection: (
        collectionName: string,
        meta: Partial<CollectionMetadata>
    ) => void;
    initializeCollections: (collections: Map<string, any>) => void;
    collectionsError: boolean;
    setCollectionsError: (newVal: boolean) => void;

    // TODO (schema edit)
    // Leaning towards this not being needed
    // removeCollections: (collection: string) => void;
}

export const getInitialCollectionData = (): Pick<
    StoreWithCollections,
    'collections' | 'collectionsError'
> => ({
    collections: {},
    collectionsError: false,
});

export const getStoreWithCollectionSettings = (
    set: NamedSet<StoreWithCollections>
): StoreWithCollections => ({
    ...getInitialCollectionData(),

    upsertCollection: (collection, meta) => {
        set((state) => ({
            ...state,
            collections: {
                ...state.collections,
                [collection]: {
                    ...(state.collections[collection] ?? {}),
                    ...meta,
                },
            },
        }));
    },

    setCollectionsError: (collectionsError) => {
        set((state) => ({
            ...state,
            collectionsError,
        }));
    },

    initializeCollections: (collections) => {
        if (collections.size < 1) {
            return;
        }

        set((state) => ({
            ...state,
            collections: {
                ...state.collections,
                ...Object.fromEntries(collections),
            },
        }));
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
});
