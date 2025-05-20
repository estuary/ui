import type { choices } from 'src/components/incompatibleSchemaChange/shared';
import type { BaseAutoCompleteOption } from 'src/components/shared/specPropEditor/types';

export interface AutoCompleteOptionForIncompatibleSchemaChange
    extends BaseAutoCompleteOption {
    val: (typeof choices)[number];
}

export interface OnIncompatibleSchemaChangeProps {
    bindingIndex?: number;
}
