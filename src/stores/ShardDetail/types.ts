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

// The hex string additions correspond to sample_grey[500] | sample_grey[300].
export type ShardStatusColor = SemanticColor | '#C4D3E9' | '#E1E9F4';

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

// Represents an endpoint that is exposed by a connector. Connectors may expose 0 or more
// endpoints, and each one will have a unique hostname that is a subdomain of the data-plane.
// An endpoint _may_ be served by multiple task processing shards if you have a task with split
// shards, in which case the data-plane-gateway would decide which shard to use for each
// connection. But an endpoint may also be specific to a single shard, even if that shard is
// just one member of a split task group.
export interface Endpoint {
    // The complete hostname to use for connecting to the given endpoint.
    fullHostname: string;
    // Whether the endpoint allows unauthenticated connections. If `isPublic` is
    // `false`, then HTTP requests made to the endpoint must contain a data-plane JWT
    // that's been signed by the control plane.
    isPublic: boolean;
    // True if any shards for the endpoint are in PRIMARY status.
    isUp: boolean;
    // The name of the protocol associated with the endpoint. A `null` protocol here
    // is a special case that means that both HTTP2 and HTTP/1.1 are supported.
    // All protocol names are given as their official (if there is one) ALPN designations,
    // for example `h2` and `http/1.1`.
    protocol: string | null;
}

export interface ShardDetailStore {
    shards: Shard[];
    setShards: SetShards;
    error: Error | string | null;
    setError: (val: ShardDetailStore['error']) => void;
    getTaskShards: (
        catalogNamespace: string | undefined,
        shards: Shard[]
    ) => Shard[];
    getTaskShardDetails: (
        taskShards: Shard[],
        defaultStatusColor: ShardStatusColor
    ) => TaskShardDetailsWithShard[];
    // Returns an array of endpoints for the task. In the case that the task has multiple shards,
    // this will _only_ return endpoints that are served by all of the shards. In other words, endpoints
    // for connecting to specific shards will be omitted from the results.
    getTaskEndpoints: (
        taskName: string,
        dataPlaneHostname: string | null
    ) => Endpoint[];
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
