import { JsonFormsData } from 'types';

export interface StorageMappingState {
    provider: string;
    updateProvider: (value: string) => void;

    formValue: JsonFormsData;
    updateFormValue: (value: JsonFormsData) => void;

    resetForm: () => void;

    pubId: string;
    setPubId: (value: string) => void;

    logToken: string;
    setLogToken: (value: string) => void;

    resetPublication: () => void;
}
