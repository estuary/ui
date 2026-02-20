import type { Entity } from 'src/types';

// Only allowing scopes that have been tested to ensure they work
export type AllowedScopes = 'key' | 'schema' | 'readSchema';

export type EditorChangeHandler = (
    newVal: any,
    path: string,
    specType: Entity,
    scope?: string
) => any;

export interface MonacoEditorProps {
    localZustandScope: boolean;
    disabled?: boolean;
    onChange?: EditorChangeHandler;
    height?: number;
    toolbarHeight?: number;
    editorSchemaScope?: string; // Used to scope the schema editor
    defaultLanguage?: 'json' | 'sql';
    defaultValue?: string;
    path?: string;
    editorLabel?: string;
    manuallySynced?: boolean;
}
