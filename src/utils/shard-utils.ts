import { Shard } from 'data-plane-gateway/types/shard_client';
import { ShardDetails } from 'stores/ShardDetail';

export const getShardDetails = (shards: Shard[]): ShardDetails[] => {
    const test = shards.map((shard) => ({
        id: shard.spec.id,
        errors: shard.status.find(({ code }) => code === 'FAILED')?.errors,
    }));

    console.log('TEST');
    console.log(test);

    return test;
};
