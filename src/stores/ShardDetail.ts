import produce from 'immer';
import { GetState } from 'zustand';
import { NamedSet } from 'zustand/middleware';

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

            const selectedShard = shards.find((shard) =>
                shard.spec.id.includes(catalogNamespace)
            );

            switch (selectedShard?.status[0].code) {
                case 'PRIMARY':
                case 'BACKFILL':
                    return '#40B763';
                case 'STANDBY':
                    return '#F5D75E';
                case 'FAILED':
                    return '#C9393E';
                default:
                    return '#F7F7F7';
            }
        },
    };
};

export const shardDetailSelectors = {
    shards: (state: ShardDetailStore) => state.shards,
    setShards: (state: ShardDetailStore) => state.setShards,
    getShardStatus: (state: ShardDetailStore) => state.getShardStatus,
};
