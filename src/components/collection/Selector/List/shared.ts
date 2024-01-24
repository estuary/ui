export const COLLECTION_SELECTOR_ID_COL = 'id';
export const COLLECTION_SELECTOR_NAME_COL = 'name';
export const COLLECTION_SELECTOR_STRIPPED_PATH_NAME = 'strippedPathName';

export const getCollectionSelector = (isCapture: boolean) =>
    isCapture
        ? COLLECTION_SELECTOR_STRIPPED_PATH_NAME
        : COLLECTION_SELECTOR_NAME_COL;

export const ID_CONCAT_STRING = '~~~';
export const getCollectionNameWithIndex = (name: string, index: number) =>
    name.includes(ID_CONCAT_STRING)
        ? name
        : `${index}${ID_CONCAT_STRING}${name}`;

export const getCollectionNameWithoutIndex = (name: string) => {
    return name.includes(ID_CONCAT_STRING)
        ? name.split(ID_CONCAT_STRING)[1]
        : name;
};
