import { StoreName } from 'stores/names';
import { StoreApi, useStore } from 'zustand';

// TODO (zustand): Determine a method to store UI stores. The following stores
// use this method: details form.
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
