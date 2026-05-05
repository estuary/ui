import type { ReactNode } from 'react';
import type { BaseAutoCompleteOption } from 'src/components/shared/specPropEditor/types';
import type { TargetSchemas } from 'src/stores/SourceCapture/types';

// TODO (target naming:post migration:update) - we mainly just use these as strings
//  in the new version - so remove the `ReactNode` typing
export interface AutoCompleteOptionForTargetSchemaExample {
    schema: string | ReactNode;
    table: string | ReactNode;
    tablePrefix: string | ReactNode;
    sourceTable?: string;
    sourceName?: string;
    sourceSchema?: string;
}

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
