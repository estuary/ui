import * as broker from "./gen/broker/protocol/broker.js";
import { JournalSelector } from "./selector.js";
import { JsonObject, ResponseError } from "./util.js";
import { Result } from "./result.js";
export declare class JournalClient {
    private authToken;
    private baseUrl;
    constructor(baseUrl: URL, authToken: string);
    list(include?: JournalSelector, exclude?: JournalSelector): Promise<Result<Array<broker.ProtocolJournalSpec>, ResponseError>>;
    read(req: broker.ProtocolReadRequest): Promise<Result<ReadableStream<broker.ProtocolReadResponse>, ResponseError>>;
}
export declare function parseJournalDocuments(stream: ReadableStream<broker.ProtocolReadResponse>): ReadableStream<JsonObject>;
