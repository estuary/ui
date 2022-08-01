import {
    getInitialState as getInitialShardDetailState,
    ShardDetailStore,
} from 'stores/ShardDetail';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export enum Stores {
    EMPTY = '',
    CAPTURE_SHARD_DETAIL = 'captureShardDetail',
    MATERIALIZATION_SHARD_DETAIL = 'materializationShardDetail',
}

// TODO (typing) : Need to get the map typed and get the selectors passing back types
export const storeMap = new Map<Stores, any>();

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
