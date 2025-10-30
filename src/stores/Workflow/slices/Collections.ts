import type { NamedSet } from 'zustand/middleware';

interface CollectionMetadata {
    spec: any;
    belongsToDraft: boolean;
}

interface CollectionDictionary {
    [collection: string]: CollectionMetadata;
}

export interface StoreWithCollections {
    collections: CollectionDictionary;
    addCollections: (collection: string, definition?: any) => void;
    removeCollections: (collection: string) => void;
}

const generateCollectionMetaData = (definition?: CollectionMetadata) => {
    if (!definition) {
        return {
            spec: null,
            belongsToDraft: false,
        };
    }

    return definition;
};

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

    addCollections: (name, definition) => {
        set((state) => ({
            ...state,
            collections: {
                ...state.collections,
                [name]: generateCollectionMetaData(definition),
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
