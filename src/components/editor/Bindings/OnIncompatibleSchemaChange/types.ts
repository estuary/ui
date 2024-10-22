import { choices } from './shared';

export interface AutoCompleteOption {
    description: string;
    label: string;
    val: (typeof choices)[number];
}

export interface SelectorOptionProps {
    option: AutoCompleteOption;
}

export interface OnIncompatibleSchemaChangeFormProps {
    bindingIndex?: number;
}
