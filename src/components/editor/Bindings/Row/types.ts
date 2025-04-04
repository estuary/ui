export interface ErrorIndicatorProps {
    bindingUUID: string;
    collection: string;
}

export interface SelectorNameProps {
    bindingUUID: string;
    collection: string[];
    highlightName?: any; // TODO (search) we don't want booleans - need custom styling support
}
