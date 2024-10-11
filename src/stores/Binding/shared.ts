import { ResourceConfigDictionary } from './types';

// Used to mark fields that should be removed during generation. This is
//      only here because if we set something to null and then check for nulls
//      we might end up overwritting a value a user specifically wants a null for.
export const REMOVE_DURING_GENERATION = undefined;

export const getAllCollections = (configs: ResourceConfigDictionary) => {
    return Object.values(configs);
};

export const getAllCollectionNames = (configs: ResourceConfigDictionary) => {
    return getAllCollections(configs).map(({ meta }) => meta.collectionName);
};

export const getAllEnabledCollectionNames = (
    configs: ResourceConfigDictionary
) => {
    return getAllCollections(configs)
        .filter(({ meta }) => !meta.disable)
        .map(({ meta }) => meta.collectionName);
};
