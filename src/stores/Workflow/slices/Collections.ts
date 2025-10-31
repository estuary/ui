import type { NamedSet } from 'zustand/middleware';

export interface CollectionMetadata {
    spec: any;
    belongsToDraft: boolean;
}

interface CollectionDictionary {
    [collection: string]: CollectionMetadata;
}

export interface StoreWithCollections {
    collections: CollectionDictionary;
    addCollection: (collectionName: string, meta: CollectionMetadata) => void;
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

    addCollection: (collection, meta) => {
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
