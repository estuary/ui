import * as broker from "./gen/broker/protocol/broker.js";
import { Result } from "./result.js";
export declare type JsonObject = Record<string, unknown>;
export declare function trimUrl(orig: URL): string;
export declare function doFetch(url: string, authToken: string, body: unknown): Promise<Result<Response, Response>>;
export declare class ResponseError {
    readonly body: broker.RuntimeError | broker.RuntimeStreamError;
    readonly response: Response;
    readonly status: string;
    private constructor();
    static fromResponse(response: Response): Promise<ResponseError>;
    static fromStreamResponse(response: Response): Promise<ResponseError>;
}
export declare type sortFn<T> = (a: T, b: T) => number;
export declare function sortBy<T, K extends keyof T>(...fields: Array<K>): sortFn<T>;
