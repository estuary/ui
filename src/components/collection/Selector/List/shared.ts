export const COLLECTION_SELECTOR_ID_COL = 'id';
export const COLLECTION_SELECTOR_NAME_COL = 'name';
export const COLLECTION_SELECTOR_STRIPPED_PATH_NAME = 'strippedPathName';

export const getCollectionSelector = (isCapture: boolean) =>
    isCapture
        ? COLLECTION_SELECTOR_STRIPPED_PATH_NAME
        : COLLECTION_SELECTOR_NAME_COL;

export const ID_CONCAT_STRING = '~~';

export const generateCollectionNameWithIndex = (name: string, index: number) =>
    name.includes(ID_CONCAT_STRING)
        ? name
        : `${index}${ID_CONCAT_STRING}${name}`;

export const getCollectionNameWithIndex = (name: string, index: number) =>
    name.includes(ID_CONCAT_STRING)
        ? name
        : `${index}${ID_CONCAT_STRING}${name}`;

export const getCollectionNameWithoutIndex = (name: string) =>
    name.includes(ID_CONCAT_STRING) ? name.split(ID_CONCAT_STRING)[1] : name;

export const getCollectionNameAndIndex = (name: string): [number, string] => {
    if (name.includes(ID_CONCAT_STRING)) {
        const splitName = name.split(ID_CONCAT_STRING);

        return [Number.parseInt(splitName[0], 10), splitName[1]];
    }

    return [-1, name];
};
