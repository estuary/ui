import { CreateEntityStore, getInitialCreateState } from 'stores/Create';
import {
    ShardDetailStore,
    getInitialState as getInitialShardDetailState,
} from 'stores/ShardDetail';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export enum Stores {
    EMPTY = '',
    CAPTURE_CREATE = 'captureCreate',
    CAPTURE_SHARD_DETAIL = 'captureShardDetail',
    MATERIALIZATION_CREATE = 'materializationCreate',
    MATERIALIZATION_SHARD_DETAIL = 'materializationShardDetail',
}

// TODO (typing) : Need to get the map typed and get the selectors passing back types
export const storeMap = new Map<Stores, any>();

storeMap.set(
    Stores.CAPTURE_CREATE,
    create<CreateEntityStore>()(
        devtools(
            (set, get) =>
                getInitialCreateState(set, get, false, Stores.CAPTURE_CREATE),
            devtoolsOptions(Stores.CAPTURE_CREATE)
        )
    )
);

storeMap.set(
    Stores.MATERIALIZATION_CREATE,
    create<CreateEntityStore>()(
        devtools(
            (set, get) =>
                getInitialCreateState(
                    set,
                    get,
                    true,
                    Stores.MATERIALIZATION_CREATE
                ),
            devtoolsOptions(Stores.MATERIALIZATION_CREATE)
        )
    )
);

storeMap.set(
    Stores.CAPTURE_SHARD_DETAIL,
    create<ShardDetailStore>()(
        devtools(
            getInitialShardDetailState,
            devtoolsOptions(Stores.CAPTURE_SHARD_DETAIL)
        )
    )
);

storeMap.set(
    Stores.MATERIALIZATION_SHARD_DETAIL,
    create<ShardDetailStore>()(
        devtools(
            getInitialShardDetailState,
            devtoolsOptions(Stores.MATERIALIZATION_SHARD_DETAIL)
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
