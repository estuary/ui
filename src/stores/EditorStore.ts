import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';

type GenericSchema = string | JSON;

export interface EditorState {
    resources: { [name: string]: GenericSchema };
    loadResource: (name: string, schema: GenericSchema) => void;
    updateResource: (name: string, schema: GenericSchema) => void;
    clearResources: () => void;
}

const useEditorStore = create<EditorState>(
    devtoolsInNonProd(
        (set) => ({
            resources: {},
            loadResource: (name, schema) =>
                set(
                    (state) => ({
                        resources: { ...state.resources, [name]: schema },
                    }),
                    false,
                    `Resource Loaded: ${name}`
                ),
            // TODO: Add error handling for JSON.parse().
            updateResource: (name, schema) =>
                set(
                    (state) => ({
                        resources: {
                            ...state.resources,
                            [name]:
                                typeof schema === 'string'
                                    ? JSON.parse(schema)
                                    : schema,
                        },
                    }),
                    false,
                    `Resource Updated: ${name}`
                ),
            clearResources: () =>
                set(() => ({ resources: {} }), false, 'Resources Cleared'),
        }),
        { name: 'editor-state' }
    )
);

export default useEditorStore;
