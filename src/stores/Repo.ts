import { CreateEntityStore, getInitialState } from 'stores/Create';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export enum Stores {
    EMPTY = '',
    CAPTURE_CREATE = 'captureCreate',
    MATERIALIZATION_CREATE = 'materializationCreate',
}

export const storeMap = new Map();

storeMap.set(
    Stores.CAPTURE_CREATE,
    create<CreateEntityStore>()(
        devtools(getInitialState, devtoolsOptions(Stores.CAPTURE_CREATE))
    )
);

storeMap.set(
    Stores.MATERIALIZATION_CREATE,
    create<CreateEntityStore>()(
        devtools(getInitialState, devtoolsOptions(Stores.CAPTURE_CREATE))
    )
);

export const getStore = (key: Stores) => {
    if (key === Stores.EMPTY) {
        throw new Error(
            'No store name provided to fetch. Ensure StoreMap and RouteStoreProvider are both configured correctly.'
        );
    } else {
        return storeMap.get(key);
    }
};
