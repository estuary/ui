import type { editor } from 'monaco-editor';

export interface ServerErrorDetailProps {
    val: string | string[];
    options?: editor.IStandaloneEditorConstructionOptions;
}
