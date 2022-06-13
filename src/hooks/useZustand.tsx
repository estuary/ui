import {
    createContext as reactCreateContext,
    ReactNode,
    useContext,
} from 'react';
import useConstant from 'use-constant';
import { StateSelector, StoreApi, useStore } from 'zustand';

interface ZustandProviderProps {
    storeOptions: { [storeName: string]: (storeName: string) => unknown };
    children: ReactNode;
}

export enum CaptureStoreNames {
    SELECT_TABLE = 'Captures-Selectable-Table',
    DRAFT_SPEC_EDITOR = 'draftSpecEditor-Captures',
}

export enum MaterializationStoreNames {
    SELECT_TABLE = 'Materializations-Selectable-Table',
    DRAFT_SPEC_EDITOR = 'draftSpecEditor-Materializations',
}

export const ZustandContext = reactCreateContext<any | null>(null);
export const ZustandProvider = ({
    storeOptions,
    children,
}: ZustandProviderProps) => {
    return (
        <ZustandContext.Provider value={storeOptions}>
            {children}
        </ZustandContext.Provider>
    );
};

// TODO (useZustand) it would be great to check that the parent exists
//   and if so then enable the functionality relying on this. An example
//   where this would be good is the tables as any tables currently needs
//   the store even if they don't allow for selection
export const useZustandStore = <S extends Object, U>(
    storeName: string,
    selector: StateSelector<S, U>,
    equalityFn?: any
) => {
    const storeOptions = useContext(ZustandContext);
    const createStore = storeOptions[storeName];

    const store = useConstant(() => createStore(storeName));

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(
        store,
        selector,
        equalityFn
    );
};
