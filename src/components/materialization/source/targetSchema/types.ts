import type { AutoCompleteOptionForTargetSchemaExample } from 'src/components/materialization/targetNaming/types';
import type { BaseAutoCompleteOption } from 'src/components/shared/specPropEditor/types';
import type { TargetSchemas } from 'src/stores/SourceCapture/types';

export interface AutoCompleteOptionForTargetSchema
    extends BaseAutoCompleteOption {
    example: AutoCompleteOptionForTargetSchemaExample;
    publicExample?: AutoCompleteOptionForTargetSchemaExample;
    val: TargetSchemas;
}

export interface OptionExampleProps {
    example: AutoCompleteOptionForTargetSchemaExample;
    baseTableMessageID: string;
}
