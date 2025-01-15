export type TabOptions = 'config' | 'schema' | 'field_selection';

export interface AdvancedOptionsProps {
    bindingIndex: number;
    bindingUUID: string;
    collectionName: string;
}

export interface CollectionData {
    spec: any;
    belongsToDraft: boolean;
}

export interface SelectedCollectionChangeData {
    name: string;
}
