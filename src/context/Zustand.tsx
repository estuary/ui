import { createEditorStore } from 'components/editor/Store';
import { createSelectableTableStore } from 'components/tables/Store';
import {
    createContext as createReactContext,
    ReactNode,
    useContext,
} from 'react';
import { createDetailsFormStore } from 'stores/DetailsForm';
import { createEndpointConfigStore } from 'stores/EndpointConfig';
import { createFormStateStore } from 'stores/FormState';
import { createResourceConfigStore } from 'stores/ResourceConfig';
import useConstant from 'use-constant';
import { StoreApi, useStore } from 'zustand';

export enum DetailsFormStoreNames {
    CAPTURE_CREATE = 'Capture-Create-Details-Form',
    MATERIALIZATION_CREATE = 'Materialization-Create-Details-Form',
}

export enum DraftEditorStoreNames {
    CAPTURE = 'draftSpecEditor-Captures',
    MATERIALIZATION = 'draftSpecEditor-Materializations',
}

export enum EndpointConfigStoreNames {
    CAPTURE_CREATE = 'Capture-Create-Endpoint-Config',
    MATERIALIZATION_CREATE = 'Materialization-Create-Endpoint-Config',
}

export enum FormStateStoreNames {
    CAPTURE_CREATE = 'Capture-Create-Form-State',
    MATERIALIZATION_CREATE = 'Materialization-Create-Form-State',
}

export enum LiveSpecEditorStoreNames {
    GENERAL = 'liveSpecEditor',
}

export enum ResourceConfigStoreNames {
    MATERIALIZATION_CREATE = 'Materialization-Create-Resource-Config',
}

export enum SelectTableStoreNames {
    ACCESS_GRANTS = 'AccessGrants-Selectable-Table',
    CAPTURE = 'Captures-Selectable-Table',
    COLLECTION = 'Collections-Selectable-Table',
    CONNECTOR = 'Connectors-Selectable-Table',
    MATERIALIZATION = 'Materializations-Selectable-Table',
}

export type StoreName =
    | DetailsFormStoreNames
    | DraftEditorStoreNames
    | EndpointConfigStoreNames
    | FormStateStoreNames
    | LiveSpecEditorStoreNames
    | ResourceConfigStoreNames
    | SelectTableStoreNames;

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

const stores = {
    // Details Form Store
    [DetailsFormStoreNames.CAPTURE_CREATE]: createDetailsFormStore(
        DetailsFormStoreNames.CAPTURE_CREATE
    ),
    [DetailsFormStoreNames.MATERIALIZATION_CREATE]: createDetailsFormStore(
        DetailsFormStoreNames.MATERIALIZATION_CREATE
    ),

    // Draft Editor Store
    [DraftEditorStoreNames.CAPTURE]: createEditorStore(
        DraftEditorStoreNames.CAPTURE
    ),
    [DraftEditorStoreNames.MATERIALIZATION]: createEditorStore(
        DraftEditorStoreNames.MATERIALIZATION
    ),

    // Endpoint Config Store
    [EndpointConfigStoreNames.CAPTURE_CREATE]: createEndpointConfigStore(
        EndpointConfigStoreNames.CAPTURE_CREATE
    ),
    [EndpointConfigStoreNames.MATERIALIZATION_CREATE]:
        createEndpointConfigStore(
            EndpointConfigStoreNames.MATERIALIZATION_CREATE
        ),

    // Form State Store
    [FormStateStoreNames.CAPTURE_CREATE]: createFormStateStore(
        FormStateStoreNames.CAPTURE_CREATE
    ),
    [FormStateStoreNames.MATERIALIZATION_CREATE]: createFormStateStore(
        FormStateStoreNames.MATERIALIZATION_CREATE
    ),

    // Resource Config Store
    [ResourceConfigStoreNames.MATERIALIZATION_CREATE]:
        createResourceConfigStore(
            ResourceConfigStoreNames.MATERIALIZATION_CREATE
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
