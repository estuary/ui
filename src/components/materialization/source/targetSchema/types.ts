import type { BaseAutoCompleteOption } from 'src/components/shared/specPropEditor/types';
import type { TargetSchemas } from 'src/stores/SourceCapture/types';

export interface AutoCompleteOptionForTargetSchemaExample {
    schema: string | null;
    table: string;
}

export interface AutoCompleteOptionForTargetSchema
    extends BaseAutoCompleteOption {
    val: TargetSchemas;
}
