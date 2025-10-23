import type { Monaco } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import type { MutableRefObject } from 'react';
import type { Entity } from 'src/types';

// Only allowing scopes that have been tested to ensure they work
export type AllowedScopes = 'key' | 'schema' | 'readSchema';

type EditorChangeHandler = (
    newVal: any,
    path: string,
    specType: Entity,
    scope?: string
) => any;

export interface MonacoEditorProps {
    localZustandScope: boolean;
    defaultLanguage?: 'json' | 'sql';
    defaultValue?: string;
    disabled?: boolean;
    editorLabel?: string;
    editorSchemaScope?: string; // Used to scope the schema editor
    height?: number;
    manuallySynced?: boolean;
    onChange?: EditorChangeHandler;
    onMount?: (
        editor: MutableRefObject<monacoEditor.editor.IStandaloneCodeEditor | null>,
        monaco: Monaco
    ) => void;
    path?: string;
    toolbarHeight?: number;
}
