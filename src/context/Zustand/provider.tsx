import { createContext as createReactContext, useContext } from 'react';

import { StoreApi, useStore } from 'zustand';

import { StoreName } from 'stores/names';

import invariableStores from './invariableStores';
import { ZustandProviderProps } from './types';

export const ZustandContext = createReactContext<any | null>(null);

export const ZustandProvider = ({ children }: ZustandProviderProps) => {
    return (
        <ZustandContext.Provider value={invariableStores}>
            {children}
        </ZustandContext.Provider>
    );
};

// TODO (useZustand) it would be great to check that the parent exists
//   and if so then enable the functionality relying on this. An example
//   where this would be good is the tables as any tables currently needs
//   the store even if they don't allow for selection
export const useZustandStore = <S extends Object, U>(
    storeName: StoreName,
    selector: (state: S) => U,
    equalityFn?: any
) => {
    const storeOptions = useContext(ZustandContext);
    const store = storeOptions[storeName];

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(
        store,
        selector,
        equalityFn
    );
};
