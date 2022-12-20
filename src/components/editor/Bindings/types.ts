export type TabOptions = 'config' | 'schema';

export interface MuiTabProps {
    label: string;
    value: TabOptions;
}

export interface CollectionData {
    spec: any;
    belongsToDraft: boolean;
}
