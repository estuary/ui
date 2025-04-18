import type { choices } from 'src/components/incompatibleSchemaChange/shared';

export interface BaseFormProps {
    currentSetting: any;
    scope: 'binding' | 'spec';
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
