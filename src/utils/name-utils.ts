import { forEach } from 'lodash';

export const MAX_VERSION_ERROR = 'version max';

const COLLECTION_VERSION_RE = new RegExp('.*[_-][vV](?<version>\\d+)$');
export const suggestedName = (oldName: string) => {
    const regExMatch = COLLECTION_VERSION_RE.exec(oldName);

    if (regExMatch !== null) {
        const currentVersion = parseInt(regExMatch[1], 10);
        return `${oldName.substring(0, oldName.length - regExMatch[1].length)}${
            currentVersion + 1
        }`;
    }

    return `${oldName}_v2`;
};

export const incrementCollectionNames = (collections: string[]) => {
    const response = {};

    // Go through all the collections and make sure the names are properly versioned
    forEach(collections, (collectionName) => {
        response[collectionName] = suggestedName(collectionName);
    });

    return response;
};
