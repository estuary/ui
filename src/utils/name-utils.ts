const COLLECTION_VERSION_RE = new RegExp('.*[_-][vV](\\d+)$');

// This function is currently unused, as we only pass the `old_name` to the evolutions handler.
// In the future, we'd like to present a more comprehensive message, with a suggested action for each
// incompatible collection, and at that point this will once again be needed. This function will also
// be needed by another future feature allowing users to manually re-create collections.
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
            old_name: collectionName,
            // Leave `new_name` unset for now, which will allow the evolutions
            // handler to only re-create materialization bindings in cases where
            // collections use the `x-infer-schema` attribute.
            // new_name: suggestedName(collectionName),
        };
    });
};
