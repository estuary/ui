import type { NamedSet } from 'zustand/middleware';

export interface CollectionMetadata {
    spec: any;
    belongsToDraft: boolean;
    // TODO (schema edit?) this is a lot to transfer but should come over here
    // ui/src/stores/Binding/types.ts
    // added?: boolean;
    // previouslyBound?: boolean;
    // sourceBackfillRecommended?: boolean;
    // trialStorage?: boolean;
    // updatedAt?: string;
}

interface CollectionDictionary {
    [collection: string]: CollectionMetadata;
}

export interface StoreWithCollections {
    collections: CollectionDictionary;
    upsertCollection: (
        collectionName: string,
        meta: CollectionMetadata
    ) => void;
    initializeCollections: (collections: Map<string, any>) => void;
    removeCollections: (collection: string) => void;
}

export const getInitialCollectionData = (): Pick<
    StoreWithCollections,
    'collections'
> => ({
    collections: {},
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
                [collection]: meta,
            },
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

    removeCollections: (name) => {
        set((state) => {
            return {
                ...state,
                collections: Object.fromEntries(
                    Object.entries(state.collections).filter(
                        ([key]) => !name.includes(key)
                    )
                ),
            };
        });
    },
});
