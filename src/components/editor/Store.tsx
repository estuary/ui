import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface EditorStoreState<T> {
    id: string | null;
    setId: (newVal: EditorStoreState<T>['id']) => void;

    currentCatalog: any;
    setCurrentCatalog: (newVal: EditorStoreState<T>['currentCatalog']) => void;

    // TODO (typing) : This needs typed. Using the T here made the checks in setSpecs break
    specs: any[] | null;
    setSpecs: (newVal: EditorStoreState<T>['specs']) => void;

    serverUpdate: any | null;
    setServerUpdate: (newVal: EditorStoreState<T>['serverUpdate']) => void;
}

const getInitialStateData = () => {
    return {
        currentCatalog: null,
        id: null,
        specs: null,
        serverUpdate: null,
    };
};

const getInitialState = <T,>(
    set: NamedSet<EditorStoreState<T>>
): EditorStoreState<T> => {
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
                    if (newVal && newVal.length > 0) {
                        if (state.specs === null) {
                            state.currentCatalog = newVal[0];
                        }
                        state.specs = newVal;
                    }
                }),
                false
            );
        },

        setServerUpdate: (newVal) => {
            set(
                produce((state) => {
                    state.serverUpdate = newVal;
                }),
                false
            );
        },
    };
};

export const createEditorStore = <T,>(key: string) => {
    return create<EditorStoreState<T>>()(
        devtools((set) => getInitialState<T>(set), devtoolsOptions(key))
    );
};
