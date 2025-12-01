import { Result } from "./result.js";
import { ShardSelector } from "./selector.js";
import { doFetch, ResponseError } from "./util.js";
export class ShardClient {
    constructor(baseUrl, authToken) {
        Object.defineProperty(this, "authToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.authToken = authToken;
        this.baseUrl = baseUrl;
    }
    async list(include = new ShardSelector(), exclude = new ShardSelector()) {
        const url = `${this.baseUrl.toString()}v1/shards/list`;
        const body = {
            selector: {
                include: include.toLabelSet(),
                exclude: exclude.toLabelSet(),
            },
        };
        const result = await doFetch(url, this.authToken, body);
        if (result.ok()) {
            const data = await result.unwrap().json();
            return Result.Ok(data.shards.map((s) => {
                return { spec: s.spec, status: s.status };
            }));
        }
        else {
            return Result.Err(await ResponseError.fromResponse(result.unwrap_err()));
        }
    }
    async stat(shard, readThrough) {
        const url = `${this.baseUrl.toString()}v1/shards/stat`;
        const body = { shard, readThrough };
        const result = await doFetch(url, this.authToken, body);
        if (result.ok()) {
            const data = await result.unwrap().json();
            return Result.Ok(data);
        }
        else {
            return Result.Err(await ResponseError.fromResponse(result.unwrap_err()));
        }
    }
}
