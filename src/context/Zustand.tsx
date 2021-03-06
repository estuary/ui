import { createEditorStore } from 'components/editor/Store';
import { createSelectableTableStore } from 'components/tables/Store';
import {
    createContext as createReactContext,
    ReactNode,
    useContext,
} from 'react';
import useConstant from 'use-constant';
import { StateSelector, StoreApi, useStore } from 'zustand';

export enum DraftEditorStoreNames {
    CAPTURE = 'draftSpecEditor-Captures',
    MATERIALIZATION = 'draftSpecEditor-Materializations',
}

export enum LiveSpecEditorStoreNames {
    GENERAL = 'liveSpecEditor',
}

export enum SelectTableStoreNames {
    ACCESS_GRANTS = 'AccessGrants-Selectable-Table',
    CAPTURE = 'Captures-Selectable-Table',
    COLLECTION = 'Collections-Selectable-Table',
    CONNECTOR = 'Connectors-Selectable-Table',
    MATERIALIZATION = 'Materializations-Selectable-Table',
}

export type StoreName =
    | DraftEditorStoreNames
    | LiveSpecEditorStoreNames
    | SelectTableStoreNames;

export type UseZustandStore = <S extends Object, U>(
    storeName: StoreName,
    selector: StateSelector<S, U>,
    equalityFn?: any
) => U;

interface ZustandProviderProps {
    children: ReactNode;
    storeSlice?: {
        storeName: string;
        createStore: (key: string) => unknown;
    };
}

const stores = {
    [DraftEditorStoreNames.CAPTURE]: createEditorStore(
        DraftEditorStoreNames.CAPTURE
    ),
    [DraftEditorStoreNames.MATERIALIZATION]: createEditorStore(
        DraftEditorStoreNames.MATERIALIZATION
    ),
    [SelectTableStoreNames.ACCESS_GRANTS]: createSelectableTableStore(
        SelectTableStoreNames.ACCESS_GRANTS
    ),
    [SelectTableStoreNames.CAPTURE]: createSelectableTableStore(
        SelectTableStoreNames.CAPTURE
    ),
    [SelectTableStoreNames.COLLECTION]: createSelectableTableStore(
        SelectTableStoreNames.COLLECTION
    ),
    [SelectTableStoreNames.CONNECTOR]: createSelectableTableStore(
        SelectTableStoreNames.CONNECTOR
    ),
    [SelectTableStoreNames.MATERIALIZATION]: createSelectableTableStore(
        SelectTableStoreNames.MATERIALIZATION
    ),
};

export const ZustandContext = createReactContext<any | null>(null);

export const ZustandProvider = ({
    children,
    storeSlice,
}: ZustandProviderProps) => {
    const storeOptions = useConstant(() => {
        if (storeSlice) {
            const { storeName, createStore } = storeSlice;

            return { [storeName]: createStore };
        } else {
            return stores;
        }
    });

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
    storeName: StoreName,
    selector: StateSelector<S, U>,
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
