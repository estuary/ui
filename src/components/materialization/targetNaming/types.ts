import type { ReactNode } from 'react';

export type InputMode = 'fixed' | 'template';

// TODO (target naming:post migration:update) - we mainly just use these as strings
//  in the new version - so remove the `ReactNode` typing
// Also - this should be moved targetNaming directory

export interface AutoCompleteOptionForTargetSchemaExample {
    schema: string | ReactNode;
    table: string | ReactNode;
    tablePrefix: string | ReactNode;
    sourceTable?: string;
    sourceName?: string;
    sourceSchema?: string;
}
