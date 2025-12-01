import * as consumer from "./gen/consumer/protocol/consumer.js";
import { Result } from "./result.js";
import { ShardSelector } from "./selector.js";
import { ResponseError } from "./util.js";
export interface Shard {
    spec: consumer.ConsumerShardSpec;
    status: Array<consumer.ConsumerReplicaStatus>;
}
export declare class ShardClient {
    private authToken;
    private baseUrl;
    constructor(baseUrl: URL, authToken: string);
    list(include?: ShardSelector, exclude?: ShardSelector): Promise<Result<Array<Shard>, ResponseError>>;
    stat(shard: string, readThrough: Record<string, string>): Promise<Result<consumer.ConsumerStatResponse, ResponseError>>;
}
