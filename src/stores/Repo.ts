import { CreateEntityStore, getInitialCreateState } from 'stores/Create';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export enum Stores {
    EMPTY = '',
    CAPTURE_CREATE = 'captureCreate',
    MATERIALIZATION_CREATE = 'materializationCreate',
}

// TODO (typing) : Need to get the map typed and get the selectors passing back types
export const storeMap = new Map<Stores, any>();

storeMap.set(
    Stores.CAPTURE_CREATE,
    create<CreateEntityStore>()(
        devtools(
            (set, get) => getInitialCreateState(set, get, false),
            devtoolsOptions(Stores.CAPTURE_CREATE)
        )
    )
);

storeMap.set(
    Stores.MATERIALIZATION_CREATE,
    create<CreateEntityStore>()(
        devtools(
            (set, get) => getInitialCreateState(set, get, true),
            devtoolsOptions(Stores.MATERIALIZATION_CREATE)
        )
    )
);

export const useStoreRepo = (key: Stores) => {
    if (key === Stores.EMPTY) {
        throw new Error(
            'No store name provided to fetch. Ensure StoreMap and RouteStoreProvider are both configured correctly.'
        );
    } else {
        return storeMap.get(key);
    }
};
