// Used to mark fields that should be removed during generation. This is
//      only here because if we set something to null and then check for nulls

import { ResourceConfigDictionary } from './types';

//      we might end up overwritting a value a user specifically wants a null for.
export const REMOVE_DURING_GENERATION = undefined;

export const getCollections = (configs: ResourceConfigDictionary) => {
    return Object.values(configs);
};

export const getCollectionNames = (configs: ResourceConfigDictionary) => {
    return getCollections(configs).map(({ meta }) => meta.collectionName);
};

export const getEnabledCollectionNames = (
    configs: ResourceConfigDictionary
) => {
    return getCollections(configs)
        .filter(({ meta }) => !meta.disable)
        .map(({ meta }) => meta.collectionName);
};
