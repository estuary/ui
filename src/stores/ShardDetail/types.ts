import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { ResponseError } from 'data-plane-gateway/types/util';
import type { SemanticColor } from 'src/context/Theme';
import type { Entity } from 'src/types';

export enum ShardStatusMessageIds {
    PRIMARY = 'shardStatus.primary',
    FAILED = 'shardStatus.failed',
    IDLE = 'shardStatus.idle',
    SCHEMA = 'shardStatus.schema',
    STANDBY = 'shardStatus.standby',
    BACKFILL = 'shardStatus.backfill',
    DISABLED = 'shardStatus.disabled',
    COLLECTION = 'shardStatus.basicCollection',
    NONE = 'shardStatus.none',
}

export enum ShardStatusNoteIds {
    SCHEMA = 'shardStatus.schema.note',
}

export type ShardEntityTypes = Entity | 'derivation';

// The hex string additions correspond to sample_grey[500] | sample_grey[300].
export type ShardStatusColor = SemanticColor | '#C4D3E9' | '#E1E9F4';

export interface EndpointsDictionary {
    [k: string]: Endpoint;
}

export interface TaskShardDetails {
    messageId: ShardStatusMessageIds;
    color: ShardStatusColor;
    disabled?: boolean;
    messageNoteId?: ShardStatusNoteIds;

    // Newly added
    entityName?: string;
    entityType?: ShardEntityTypes;
    errors?: any[];
    exposePort?: any;
    hostname?: string;
    id?: string;
    portIsPublic?: boolean;
    portProtocol?: any;
    protoPrefix?: any;
    publicPrefix?: any;
    shardEndpoints?: EndpointsDictionary;
    spec?: Shard['spec'];
    status?: Shard['status'];
    warnings?: any[];
}

export interface TaskShardDetailsWithShard extends TaskShardDetails {
    shard: Shard | null;
}

export interface ShardDetails {
    id: string | undefined;
    errors: string[] | undefined;
}

export interface ShardReadDictionaryResponse {
    shardsHaveErrors: boolean;
    shardsHaveWarnings: boolean;
    compositeColor: ShardStatusColor;
    disabled: boolean;
    allShards: TaskShardDetails[];
    defaultMessageId: ShardStatusMessageIds;
}

export interface ShardDictionary {
    [k: string]: TaskShardDetails[] | undefined;
}

// TODO: Determine a way to access an interface property with a function type.
export type SetShards = (shards: Shard[]) => void;

// Represents an endpoint that is exposed by a connector. Connectors may expose 0 or more
// endpoints, and each one will have a unique hostname that is a subdomain of the data-plane.
// An endpoint _may_ be served by multiple task processing shards if you have a task with split
// shards, in which case the data-plane-gateway would decide which shard to use for each
// connection. But an endpoint may also be specific to a single shard, even if that shard is
// just one member of a split task group.
export interface Endpoint {
    // The complete hostname to use for connecting to the given endpoint.
    hostPrefix: string;
    // Whether the endpoint allows unauthenticated connections. If `isPublic` is
    // `false`, then HTTP requests made to the endpoint must contain a data-plane JWT
    // that's been signed by the control plane.
    isPublic: boolean;
    // The name of the protocol associated with the endpoint. A `null` protocol here
    // is a special case that means that both HTTP2 and HTTP/1.1 are supported.
    // All protocol names are given as their official (if there is one) ALPN designations,
    // for example `h2` and `http/1.1`.
    protocol: string | null;

    // Removed isUp in Q4 2023 as it was not used
    // True if any shards for the endpoint are in PRIMARY status.
    // isUp: boolean;
}

export interface ShardDetailStore {
    setShards: SetShards;
    shardDictionary: ShardDictionary;
    shardDictionaryHydrated: boolean;
    setDictionaryHydrated: (val: boolean) => void;
    defaultStatusColor: ShardStatusColor;
    setDefaultStatusColor: (val: ShardStatusColor) => void;
    defaultMessageId: ShardStatusMessageIds;
    setDefaultMessageId: (val: ShardStatusMessageIds) => void;

    error: ResponseError['body'] | string | null;
    setError: (val: ShardDetailStore['error']) => void;
}
