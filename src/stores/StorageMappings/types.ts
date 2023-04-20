export interface StorageMappingForm {
    bucket: string;
    lastUpdated: string;
    prefix: string;
    provider: string;
}

export interface StorageMappingsState {
    hydrate: () => void;
    loading: boolean;

    setSpec: (val: StorageMappingsState['spec']) => void;
    spec: StorageMappingForm | null;
}
