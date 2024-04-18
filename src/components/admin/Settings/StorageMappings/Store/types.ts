import { JsonFormsData } from 'types';

export interface StorageMappingState {
    provider: string;
    updateProvider: (value: string) => void;

    formValue: JsonFormsData;
    resetFormValue: () => void;
    updateFormValue: (value: JsonFormsData) => void;
}
