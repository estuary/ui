import { choices } from './shared';

export interface BaseFormProps {
    currentSetting: string;
    updateDraftedSetting: Function;
}

export interface AutoCompleteOption {
    description: string;
    label: string;
    val: (typeof choices)[number];
}

export interface SelectorOptionProps {
    option: AutoCompleteOption;
}

export interface OnIncompatibleSchemaChangeProps {
    bindingIndex?: number;
}
