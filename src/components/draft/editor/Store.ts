import produce from 'immer';
import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';

interface EditorStorState {
    draftId: string | null;
    setDraftId: (newVal: EditorStorState['draftId']) => void;

    currentCatalog: string | null;
    setCurrentCatalog: (newVal: EditorStorState['currentCatalog']) => void;
}

const getInitialStateData = () => {
    return {
        currentCatalog: null,
        draftId: null,
    };
};

const useEditorStore = create<EditorStorState>(
    devtoolsInNonProd(
        (set) => ({
            ...getInitialStateData(),
            setDraftId: (newVal) => {
                set(
                    produce((state) => {
                        state.draftId = newVal;
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
        }),
        { name: 'editor-state' }
    )
);

export const editorStoreSelectors = {
    draftId: (state: EditorStorState) => state.draftId,
    setDraftId: (state: EditorStorState) => state.setDraftId,
    currentCatalog: (state: EditorStorState) => state.currentCatalog,
    setCurrentCatalog: (state: EditorStorState) => state.setCurrentCatalog,
};

export default useEditorStore;
