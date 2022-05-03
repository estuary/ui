import {
    createContext as reactCreateContext,
    ReactNode,
    useContext,
} from 'react';
import useConstant from 'use-constant';
import { StateSelector, StoreApi, useStore } from 'zustand';

interface ZustandProviderProps {
    createStore: (key: string) => unknown;
    key: string;
    children: ReactNode;
}

export const ZustandContext = reactCreateContext<any | null>(null);
export const ZustandProvider = ({
    createStore,
    key,
    children,
}: ZustandProviderProps) => {
    const store = useConstant(() => createStore(key));

    return (
        <ZustandContext.Provider value={store}>
            {children}
        </ZustandContext.Provider>
    );
};

export const useZustandStore = <S extends Object, U>(
    selector: StateSelector<S, U>,
    equalityFn?: any
) => {
    const store = useContext(ZustandContext);
    return useStore<StoreApi<S>, ReturnType<typeof selector>>(
        store,
        selector,
        equalityFn
    );
};
