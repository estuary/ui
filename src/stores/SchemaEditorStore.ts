import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SchemaEditorState {
    schema: string;
    setSchema: (schema: string) => void;
    removeSchema: () => void;
}

const useSchemaEditorStore = create<SchemaEditorState>(
    devtools(
        (set) => ({
            removeSchema: () =>
                set(() => ({ schema: '' }), false, 'Schema Removed'),
            schema: '',
            setSchema: (schema) =>
                set(
                    () => ({ schema: JSON.parse(schema) }),
                    false,
                    'Schema Set'
                ),
        }),
        { name: 'schema-editor-state' }
    )
);

export default useSchemaEditorStore;
