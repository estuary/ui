export interface StorageMappingForm {
    prefix: string;
    lastUpdated: string;
    bucket: string;
    provider: string;
}

export interface StorageMappingsState {
    spec: StorageMappingForm | null;
    setSpec: (val: StorageMappingsState['spec']) => void;

    hydrate: () => void;
    loading: boolean;
}
