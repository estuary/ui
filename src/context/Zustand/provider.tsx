import type { ZustandProviderProps } from 'src/context/Zustand/types';
import type { StoreName } from 'src/stores/names';
import type { StoreApi } from 'zustand';

import { createContext as createReactContext, useContext } from 'react';

import { useStore } from 'zustand';

import invariableStores from 'src/context/Zustand/invariableStores';

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
    selector: (state: S) => U
) => {
    const storeOptions = useContext(ZustandContext);
    const store = storeOptions[storeName];

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(store, selector);
};
