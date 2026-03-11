import type { ReactNode } from 'react';
import type { StoreName } from 'src/stores/names';
import type { StoreApi } from 'zustand';

import { createContext as createReactContext, useContext } from 'react';

import { useStore } from 'zustand';

interface LocalZustandProviderProps {
    children: ReactNode;
    createStore: (key: StoreName) => unknown;
}

export const LocalZustandContext = createReactContext<any | null>(null);

export const LocalZustandProvider = ({
    children,
    createStore,
}: LocalZustandProviderProps) => {
    return (
        <LocalZustandContext.Provider value={createStore}>
            {children}
        </LocalZustandContext.Provider>
    );
};

// TODO (useZustand) it would be great to check that the parent exists
//   and if so then enable the functionality relying on this. An example
//   where this would be good is the tables as any tables currently needs
//   the store even if they don't allow for selection
export const useLocalZustandStore = <S extends Object, U>(
    storeName: StoreName,
    selector: (state: S) => U
) => {
    const store = useContext(LocalZustandContext);

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(store, selector);
};
