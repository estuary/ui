export const TITLE_REPLACEMENT = '%s%';
export const TITLE_TEMPLATE = `Estuary Flow ${TITLE_REPLACEMENT}`;

export const getTitle = (title: string) => {
    return TITLE_TEMPLATE.replace(TITLE_REPLACEMENT, title);
};
