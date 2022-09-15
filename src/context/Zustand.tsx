import { createEditorStore } from 'components/editor/Store';
import { createSelectableTableStore } from 'components/tables/Store';
import {
    createContext as createReactContext,
    ReactNode,
    useContext,
} from 'react';
import { createFormStateStore } from 'stores/FormState';
import { createShardDetailStore } from 'stores/ShardDetail';
import { MessagePrefixes } from 'types';
import useConstant from 'use-constant';
import { StoreApi, useStore } from 'zustand';

export enum DetailsFormStoreNames {
    CAPTURE = 'capture-details-form',
    MATERIALIZATION = 'materialization-details-form',
}

export enum EditorStoreNames {
    CAPTURE = 'capture_editor_store',
    GENERAL = 'general_editor_store',
    MATERIALIZATION = 'materialization_editor_store',
}

export enum EndpointConfigStoreNames {
    CAPTURE = 'capture-endpoint-config',
    MATERIALIZATION = 'materialization-endpoint-config',
}

export enum FormStateStoreNames {
    CAPTURE_CREATE = 'Capture-Create-Form-State',
    CAPTURE_EDIT = 'Capture-Edit-Form-State',
    MATERIALIZATION_CREATE = 'Materialization-Create-Form-State',
    MATERIALIZATION_EDIT = 'Materialization-Edit-Form-State',
}

export enum ResourceConfigStoreNames {
    MATERIALIZATION_CREATE = 'Materialization-Create-Resource-Config',
    MATERIALIZATION_EDIT = 'Materialization-Edit-Resource-Config',
}

export enum SelectTableStoreNames {
    ACCESS_GRANTS = 'AccessGrants-Selectable-Table',
    CAPTURE = 'Captures-Selectable-Table',
    COLLECTION = 'Collections-Selectable-Table',
    CONNECTOR = 'Connectors-Selectable-Table',
    MATERIALIZATION = 'Materializations-Selectable-Table',
}

export enum ShardDetailStoreNames {
    CAPTURE = 'Capture-Shard-Detail',
    MATERIALIZATION = 'Materialization-Shard-Detail',
}

export type StoreName =
    | DetailsFormStoreNames
    | EditorStoreNames
    | EndpointConfigStoreNames
    | FormStateStoreNames
    | ResourceConfigStoreNames
    | SelectTableStoreNames
    | ShardDetailStoreNames;

export type UseZustandStore = <S extends Object, U>(
    storeName: StoreName,
    selector: (state: S) => U,
    equalityFn?: any
) => U;

interface ZustandProviderProps {
    children: ReactNode;
    storeSlice?: {
        storeName: string;
        createStore: (key: string) => unknown;
    };
}

const invariableStores = {
    // Editor Store
    [EditorStoreNames.CAPTURE]: createEditorStore(EditorStoreNames.CAPTURE),
    [EditorStoreNames.MATERIALIZATION]: createEditorStore(
        EditorStoreNames.MATERIALIZATION
    ),

    // Form State Store
    [FormStateStoreNames.CAPTURE_CREATE]: createFormStateStore(
        FormStateStoreNames.CAPTURE_CREATE,
        MessagePrefixes.CAPTURE_CREATE
    ),
    [FormStateStoreNames.CAPTURE_EDIT]: createFormStateStore(
        FormStateStoreNames.CAPTURE_EDIT,
        MessagePrefixes.CAPTURE_EDIT
    ),
    [FormStateStoreNames.MATERIALIZATION_CREATE]: createFormStateStore(
        FormStateStoreNames.MATERIALIZATION_CREATE,
        MessagePrefixes.MATERIALIZATION_CREATE
    ),
    [FormStateStoreNames.MATERIALIZATION_EDIT]: createFormStateStore(
        FormStateStoreNames.MATERIALIZATION_EDIT,
        MessagePrefixes.MATERIALIZATION_EDIT
    ),

    // Select Table Store
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

    // Shard Detail Store
    [ShardDetailStoreNames.CAPTURE]: createShardDetailStore(
        ShardDetailStoreNames.CAPTURE
    ),
    [ShardDetailStoreNames.MATERIALIZATION]: createShardDetailStore(
        ShardDetailStoreNames.MATERIALIZATION
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
            return invariableStores;
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

// TODO (zustand) decide on how we'll store stores that are used
//  right now only details create uses this approach
const storeMap = new Map<StoreName, any>();
export const registerStores = (storeKeys: StoreName[], create: Function) => {
    storeKeys.forEach((key) => {
        storeMap.set(key, create);
    });
};
const getStore = (storeName: StoreName) => {
    let store = storeMap.get(storeName);

    if (typeof store === 'function') {
        const newStore = store(storeName);
        storeMap.set(storeName, newStore);
        store = newStore;
    }

    return store;
};

export const useZustandStoreMap = <S extends Object, U>(
    storeName: StoreName,
    selector: (state: S) => U,
    equalityFn?: any
) => {
    const store = getStore(storeName);

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(
        store,
        selector,
        equalityFn
    );
};
