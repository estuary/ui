export const COLLECTION_SELECTOR_TOGGLE_COL = 'disable';
export const COLLECTION_SELECTOR_UUID_COL = 'id';
export const COLLECTION_SELECTOR_NAME_COL = 'name';
export const COLLECTION_SELECTOR_STRIPPED_PATH_NAME = 'strippedPathName';
export const COLLECTION_SELECTOR_VISIBLE = 'visible';

export const getCollectionSelector = (endOnly: boolean) =>
    endOnly
        ? COLLECTION_SELECTOR_STRIPPED_PATH_NAME
        : COLLECTION_SELECTOR_NAME_COL;
