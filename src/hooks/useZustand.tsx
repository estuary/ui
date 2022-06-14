import { createEditorStore } from 'components/editor/Store';
import { createSelectableTableStore } from 'components/tables/Store';
import {
    createContext as createReactContext,
    ReactNode,
    useContext,
} from 'react';
import useConstant from 'use-constant';
import { StateSelector, StoreApi, useStore } from 'zustand';

interface ZustandProviderProps {
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

export enum AccessGrantsStoreNames {
    SELECT_TABLE = 'AccessGrants-Selectable-Table',
}

export enum CollectionStoreNames {
    SELECT_TABLE = 'Collections-Selectable-Table',
}

export enum ConnectorStoreNames {
    SELECT_TABLE = 'Connectors-Selectable-Table',
}

const stores = {
    [CaptureStoreNames.SELECT_TABLE]: createSelectableTableStore(
        CaptureStoreNames.SELECT_TABLE
    ),
    [CaptureStoreNames.DRAFT_SPEC_EDITOR]: createEditorStore(
        CaptureStoreNames.DRAFT_SPEC_EDITOR
    ),
    [MaterializationStoreNames.SELECT_TABLE]: createSelectableTableStore(
        MaterializationStoreNames.SELECT_TABLE
    ),
    [MaterializationStoreNames.DRAFT_SPEC_EDITOR]: createEditorStore(
        MaterializationStoreNames.DRAFT_SPEC_EDITOR
    ),
    [AccessGrantsStoreNames.SELECT_TABLE]: createSelectableTableStore(
        AccessGrantsStoreNames.SELECT_TABLE
    ),
    [CollectionStoreNames.SELECT_TABLE]: createSelectableTableStore(
        CollectionStoreNames.SELECT_TABLE
    ),
    [ConnectorStoreNames.SELECT_TABLE]: createSelectableTableStore(
        ConnectorStoreNames.SELECT_TABLE
    ),
};

export const ZustandContext = createReactContext<any | null>(null);

export const ZustandProvider = ({ children }: ZustandProviderProps) => {
    const storeOptions = useConstant(() => stores);

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
    const store = storeOptions[storeName];

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(
        store,
        selector,
        equalityFn
    );
};
