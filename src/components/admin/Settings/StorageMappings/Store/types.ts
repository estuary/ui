import { JsonFormsData } from 'types';

export interface StorageMappingState {
    formValue: JsonFormsData;
    resetFormValue: () => void;
    updateFormValue: (value: JsonFormsData) => void;
}
