export interface TenantState {
    addTrialStorageOnly: (value: string | string[]) => void;
    removeTrialStorageOnly: (value?: string) => void;
    selectedTenant: string;
    setSelectedTenant: (value: string) => void;
    trialStorageOnly: string[];
}
