import { useEntityWorkflow } from 'context/Workflow';
import { ResourceConfigStoreNames } from 'context/Zustand';
import {
    createContext as createReactContext,
    ReactNode,
    useContext,
} from 'react';
import { EntityWorkflow } from 'types';
import useConstant from 'use-constant';
import { StoreApi, useStore } from 'zustand';

interface ResourceConfigProviderProps {
    children: ReactNode;
    storeName: ResourceConfigStoreNames;
    createStore: (
        key: ResourceConfigStoreNames,
        workflow: EntityWorkflow
    ) => any;
}

const invariableStores = {
    [ResourceConfigStoreNames.MATERIALIZATION_CREATE]: {},
    [ResourceConfigStoreNames.MATERIALIZATION_EDIT]: {},
};

export const ResourceConfigContext = createReactContext<any | null>(null);

export const ResourceConfigProvider = ({
    children,
    storeName,
    createStore,
}: ResourceConfigProviderProps) => {
    const workflow = useEntityWorkflow();

    const storeOptions = useConstant(() => {
        invariableStores[storeName] = createStore(storeName, workflow);

        return invariableStores;
    });

    return (
        <ResourceConfigContext.Provider value={storeOptions}>
            {children}
        </ResourceConfigContext.Provider>
    );
};

// TODO (useZustand) it would be great to check that the parent exists
//   and if so then enable the functionality relying on this. An example
//   where this would be good is the tables as any tables currently needs
//   the store even if they don't allow for selection
export const useResourceConfigStore = <S extends Object, U>(
    storeName: ResourceConfigStoreNames,
    selector: (state: S) => U,
    equalityFn?: any
) => {
    const storeOptions = useContext(ResourceConfigContext);
    const store = storeOptions[storeName];

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(
        store,
        selector,
        equalityFn
    );
};
