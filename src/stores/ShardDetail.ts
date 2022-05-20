// import { errorMain, slate, successMain, warningMain } from 'context/Theme';
import { slate } from 'context/Theme';
import produce from 'immer';
import { GetState } from 'zustand';
import { NamedSet } from 'zustand/middleware';

// TODO: Determine a way to access an interface property with a function type.
export type SetShards = (shards: any[]) => void;

export interface ShardDetailStore {
    shards: any[];
    setShards: SetShards;
    getShardStatus: (catalogNamespace: string) => string;
}

export const getInitialState = (
    set: NamedSet<ShardDetailStore>,
    get: GetState<ShardDetailStore>
): ShardDetailStore => {
    return {
        shards: [],
        setShards: (shards) => {
            set(
                produce((state) => {
                    state.shards = shards;
                }),
                false,
                'Shard List Set'
            );
        },
        getShardStatus: (catalogNamespace) => {
            const { shards } = get();

            // const selectedShard = shards.find((shard) =>
            //     shard.spec.id.includes(catalogNamespace)
            // );

            // switch (selectedShard?.status[0].code) {
            //     case 'PRIMARY':
            //         return successMain;
            //     case 'BACKFILL':
            //     case 'STANDBY':
            //         return warningMain;
            //     case 'FAILED':
            //         return errorMain;
            //     default:
            //         return slate[25];
            // }

            return shards.length > 0 && catalogNamespace
                ? slate[25]
                : slate[200];
        },
    };
};

export const shardDetailSelectors = {
    shards: (state: ShardDetailStore) => state.shards,
    setShards: (state: ShardDetailStore) => state.setShards,
    getShardStatus: (state: ShardDetailStore) => state.getShardStatus,
};
