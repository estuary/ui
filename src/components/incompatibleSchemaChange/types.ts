import type { choices } from 'src/components/incompatibleSchemaChange/shared';
import type { BaseAutoCompleteOption } from 'src/components/shared/specPropertyEditor/types';

export interface AutoCompleteOption extends BaseAutoCompleteOption {
    val: (typeof choices)[number];
}

export interface OnIncompatibleSchemaChangeProps {
    bindingIndex?: number;
}
