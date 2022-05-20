import {
    createContext as reactCreateContext,
    ReactNode,
    useContext,
} from 'react';
import useConstant from 'use-constant';
import { StateSelector, StoreApi, useStore } from 'zustand';

interface ZustandProviderProps {
    createStore: (storeName: string) => unknown;
    storeName: string;
    children: ReactNode;
}

export const ZustandContext = reactCreateContext<any | null>(null);
export const ZustandProvider = ({
    createStore,
    storeName,
    children,
}: ZustandProviderProps) => {
    const store = useConstant(() => createStore(storeName));

    return (
        <ZustandContext.Provider value={store}>
            {children}
        </ZustandContext.Provider>
    );
};

// TODO (useZustand) it would be great to check that the parent exists
//   and if so then enable the functionality relying on this. An example
//   where this would be good is the tables as any tables currently needs
//   the store even if they don't allow for selection
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
