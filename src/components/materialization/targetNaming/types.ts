import type { ReactNode } from 'react';

export type InputMode = 'fixed' | 'template';

export interface ParseTemplateResponse {
    prefix: string;
    suffix: string;
    rawTemplate: string | null;
}

// TODO (target naming:post migration:update) - should probably remove the ReactNode option
// Also - this should be moved targetNaming directory
export interface AutoCompleteOptionForTargetSchemaExample {
    schema: string | ReactNode;
    table: string | ReactNode;
    tablePrefix: string | ReactNode;
    sourceTable?: string;
    sourceName?: string;
    sourceSchema?: string;
}
