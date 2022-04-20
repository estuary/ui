import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import produce from 'immer';
import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';

interface EditorStorState {
    id: string | null;
    setId: (newVal: EditorStorState['id']) => void;

    currentCatalog: number;
    setCurrentCatalog: (newVal: EditorStorState['currentCatalog']) => void;

    specs: DraftSpecQuery[] | null;
    setSpecs: (newVal: DraftSpecQuery[]) => void;
}

const getInitialStateData = () => {
    return {
        currentCatalog: 0,
        id: null,
        specs: null,
    };
};

const useEditorStore = create<EditorStorState>(
    devtoolsInNonProd(
        (set) => ({
            ...getInitialStateData(),
            setId: (newVal) => {
                set(
                    produce((state) => {
                        state.id = newVal;
                    }),
                    false
                );
            },

            setCurrentCatalog: (newVal) => {
                set(
                    produce((state) => {
                        state.currentCatalog = newVal;
                    }),
                    false
                );
            },

            setSpecs: (newVal) => {
                set(
                    produce((state) => {
                        state.specs = newVal;
                    }),
                    false
                );
            },
        }),
        { name: 'editor-state' }
    )
);

export const editorStoreSelectors = {
    draftId: (state: EditorStorState) => state.id,
    setDraftId: (state: EditorStorState) => state.setId,
    currentCatalog: (state: EditorStorState) => state.currentCatalog,
    setCurrentCatalog: (state: EditorStorState) => state.setCurrentCatalog,
    specs: (state: EditorStorState) => state.specs,
    setSpecs: (state: EditorStorState) => state.setSpecs,
};

export default useEditorStore;
