import { SemanticColor } from 'context/Theme';
import { Shard } from 'data-plane-gateway/types/shard_client';

// TODO: Determine a way to access an interface property with a function type.
export type SetShards = (shards: Shard[]) => void;

export enum ShardStatusMessageIds {
    PRIMARY = 'shardStatus.primary',
    FAILED = 'shardStatus.failed',
    IDLE = 'shardStatus.idle',
    STANDBY = 'shardStatus.standby',
    BACKFILL = 'shardStatus.backfill',
    DISABLED = 'shardStatus.disabled',
    COLLECTION = 'shardStatus.basicCollection',
    NONE = 'shardStatus.none',
}

// The hex string additions correspond to slate[25] | slate[800].
export type ShardStatusColor = SemanticColor | '#EEF8FF' | '#04192A';

export interface TaskShardDetails {
    messageId: ShardStatusMessageIds;
    color: ShardStatusColor;
    disabled?: boolean;
}

export interface TaskShardDetailsWithShard extends TaskShardDetails {
    shard: Shard | null;
}

export interface ShardDetails {
    id: string | undefined;
    errors: string[] | undefined;
}

export interface ShardDetailStore {
    shards: Shard[];
    setShards: SetShards;
    getTaskShards: (
        catalogNamespace: string | undefined,
        shards: Shard[]
    ) => Shard[];
    getTaskShardDetails: (
        taskShards: Shard[],
        defaultStatusColor: ShardStatusColor
    ) => TaskShardDetailsWithShard[];
    getTaskStatusColor: (
        taskShardDetails: TaskShardDetails[],
        defaultStatusColor: ShardStatusColor
    ) => ShardStatusColor;
    getShardDetails: (shards: Shard[]) => ShardDetails[];
    getShardStatusColor: (
        shardId: string,
        defaultStatusColor: ShardStatusColor
    ) => ShardStatusColor;
    getShardStatusMessageId: (shardId: string) => ShardStatusMessageIds;
    evaluateShardProcessingState: (shardId: string) => boolean;
}
