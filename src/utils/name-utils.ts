const COLLECTION_VERSION_RE = new RegExp('.*[_-][vV](\\d+)$');
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
    // Go through all the collections and make sure the names are properly versioned
    return collections.map((collectionName) => {
        return {
            [collectionName]: suggestedName(collectionName),
        };
    });
};
