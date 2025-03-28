import type { choices } from 'src/components/editor/Bindings/SchemaMode/shared';

export interface AutoCompleteOption {
    description: string;
    label: string;
    val: (typeof choices)[number];
}

export interface SelectorOptionProps {
    option: AutoCompleteOption;
}
