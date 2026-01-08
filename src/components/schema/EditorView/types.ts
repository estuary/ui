import type { MonacoEditorProps } from 'src/components/editor/MonacoEditor/types';
import type { KeyAutoCompleteProps } from 'src/components/schema/KeyAutoComplete/types';

export interface FooProps {}

export interface EditorViewProps {
    editorProps: Partial<MonacoEditorProps>;
    keyProps: KeyAutoCompleteProps;
}
