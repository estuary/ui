import * as consumer from "./gen/consumer/protocol/consumer.js";
import { Result } from "./result.js";
import { ShardSelector } from "./selector.js";
import { doFetch, ResponseError } from "./util.js";

export interface Shard {
  spec: consumer.ConsumerShardSpec,
  status: Array<consumer.ConsumerReplicaStatus>,
}

export class ShardClient {
  private authToken: string;
  private baseUrl: URL;

  constructor(baseUrl: URL, authToken: string) {
    this.authToken = authToken;
    this.baseUrl = baseUrl;
  }


  async list(
    include: ShardSelector = new ShardSelector(),
    exclude: ShardSelector = new ShardSelector(),
  ): Promise<Result<Array<Shard>, ResponseError>> {
    const url = `${this.baseUrl.toString()}v1/shards/list`;
    const body = {
      selector: {
        include: include.toLabelSet(),
        exclude: exclude.toLabelSet(),
      },
    };

    const result = await doFetch(url, this.authToken, body);

    if (result.ok()) {
      const data: consumer.ConsumerListResponse = await result.unwrap().json();
      return Result.Ok(data.shards!.map((s) => {
        return { spec: s.spec!, status: s.status! }
      }));
    } else {
      return Result.Err(await ResponseError.fromResponse(result.unwrap_err()));
    }
  }

  async stat(
    shard: string,
    readThrough: Record<string, string>,
  ): Promise<Result<consumer.ConsumerStatResponse, ResponseError>> {
    const url = `${this.baseUrl.toString()}v1/shards/stat`;
    const body = { shard, readThrough };

    const result = await doFetch(url, this.authToken, body);

    if (result.ok()) {
      const data: consumer.ConsumerStatResponse = await result.unwrap().json();
      return Result.Ok(data);
    } else {
      return Result.Err(await ResponseError.fromResponse(result.unwrap_err()));
    }
  }
}
