import { Shard } from 'data-plane-gateway/types/shard_client';
import { ShardDetails } from 'stores/ShardDetail';

export const getShardDetails = (shards: Shard[]): ShardDetails[] => {
    return shards.map((shard) => ({
        id: shard.spec.id,
        errors: shard.status.find(({ code }) => code === 'FAILED')?.errors,
    }));
};
