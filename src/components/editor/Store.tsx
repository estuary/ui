import produce from 'immer';
import {
    createContext as reactCreateContext,
    ReactNode,
    useContext,
} from 'react';
import useConstant from 'use-constant';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StateSelector, StoreApi, useStore } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface EditorStoreState<T> {
    id: string | null;
    setId: (newVal: EditorStoreState<T>['id']) => void;

    currentCatalog: number;
    setCurrentCatalog: (newVal: EditorStoreState<T>['currentCatalog']) => void;

    specs: T[] | null;
    setSpecs: (newVal: EditorStoreState<T>['specs']) => void;
}

const getInitialStateData = () => {
    return {
        currentCatalog: 0,
        id: null,
        specs: null,
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
                    state.specs = newVal;
                }),
                false
            );
        },
    };
};

const createEditorStore = <T,>(key: string) => {
    return create<EditorStoreState<T>>()(
        devtools((set) => getInitialState<T>(set), devtoolsOptions(key))
    );
};

interface ZustandProviderProps {
    stateKey: string;
    children: ReactNode;
}
export const ZustandContext = reactCreateContext<any | null>(null);
export const ZustandProvider = ({
    stateKey,
    children,
}: ZustandProviderProps) => {
    const store = useConstant(() => createEditorStore(stateKey));

    return (
        <ZustandContext.Provider value={store}>
            {children}
        </ZustandContext.Provider>
    );
};

// TODO (typing) This is brute forcing the types basically and force the functions using this
//  To be WAY too verbose than need be.
export const useZustandStore = <S extends Object, U>(
    selector: StateSelector<S, U>,
    equalityFn?: any
) => {
    const store = useContext(ZustandContext);
    return useStore<StoreApi<S>, U>(store, selector, equalityFn);
};

export const useZustandStoreNoType = (selector: any, equalityFn?: any) => {
    const store = useContext(ZustandContext);
    return useStore(store, selector, equalityFn);
};
