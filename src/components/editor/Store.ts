import { LiveSpecs } from 'components/capture/details';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import createContext from 'zustand/context';
import { devtools, NamedSet } from 'zustand/middleware';

type SupportedSpecs = DraftSpecQuery[] | LiveSpecs[] | null;

export interface EditorStoreState {
    id: string | null;
    setId: (newVal: EditorStoreState['id']) => void;

    currentCatalog: number;
    setCurrentCatalog: (newVal: EditorStoreState['currentCatalog']) => void;

    specs: SupportedSpecs;
    setSpecs: (newVal: any) => void;
}

const getInitialStateData = () => {
    return {
        currentCatalog: 0,
        id: null,
        specs: null,
    };
};

const getInitialState = (set: NamedSet<EditorStoreState>): EditorStoreState => {
    return {
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
    };
};

export const { Provider: EditorStoreProvider, useStore: useEditorStore } =
    createContext<StoreApi<EditorStoreState>>();

export const createEditorStore = (key: string) => {
    return create<EditorStoreState>()(
        devtools((set) => getInitialState(set), devtoolsOptions(key))
    );
};

export const editorStoreSelectors = {
    id: (state: EditorStoreState) => state.id,
    setId: (state: EditorStoreState) => state.setId,
    currentCatalog: (state: EditorStoreState) => state.currentCatalog,
    setCurrentCatalog: (state: EditorStoreState) => state.setCurrentCatalog,
    specs: (state: EditorStoreState) => state.specs,
    setSpecs: (state: EditorStoreState) => state.setSpecs,
};
