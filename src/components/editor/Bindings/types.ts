export type TabOptions = 'config' | 'schema';

export interface CollectionData {
    spec: any;
    belongsToDraft: boolean;
}

export interface SelectedCollectionChangeData {
    name: string;
}
