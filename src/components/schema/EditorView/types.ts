import type { MonacoEditorProps } from 'src/components/editor/MonacoEditor';
import type { KeyAutoCompleteProps } from 'src/components/schema/KeyAutoComplete/types';

export interface FooProps {}

export interface EditorViewProps {
    editorProps: Partial<MonacoEditorProps>;
    keyProps: KeyAutoCompleteProps;
}
