import * as broker from "./gen/broker/protocol/broker.js";
import { JournalSelector } from "./selector.js";
import { doFetch, JsonObject, ResponseError } from "./util.js";
import { Result } from "./result.js";
import {
  decodeContent,
  parseJSONStream,
  splitStream,
  unwrapResult,
} from "./streams.js";

export class JournalClient {
  private authToken: string;
  private baseUrl: URL;

  constructor(baseUrl: URL, authToken: string) {
    this.authToken = authToken;
    this.baseUrl = baseUrl;
  }

  async list(
    include: JournalSelector = new JournalSelector(),
    exclude: JournalSelector = new JournalSelector(),
  ): Promise<Result<Array<broker.ProtocolJournalSpec>, ResponseError>> {
    const url = `${this.baseUrl.toString()}v1/journals/list`;
    const body = {
      selector: {
        include: include.toLabelSet(),
        exclude: exclude.toLabelSet(),
      },
    };

    const result = await doFetch(url, this.authToken, body);

    if (result.ok()) {
      const data: broker.ProtocolListResponse = await result.unwrap().json();
      return Result.Ok(data.journals!.map((j) => j.spec!));
    } else {
      return Result.Err(await ResponseError.fromResponse(result.unwrap_err()));
    }
  }

  async read(
    req: broker.ProtocolReadRequest,
  ): Promise<
    Result<ReadableStream<broker.ProtocolReadResponse>, ResponseError>
  > {
    const url = `${this.baseUrl.toString()}v1/journals/read`;

    const result = await doFetch(url, this.authToken, req);

    if (result.ok()) {
      const reader = result.unwrap().body!
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(splitStream("\n"))
        .pipeThrough(parseJSONStream())
        .pipeThrough(unwrapResult());

      return Result.Ok(reader);
    } else {
      return Result.Err(
        await ResponseError.fromStreamResponse(result.unwrap_err()),
      );
    }
  }

}

export function parseJournalDocuments(
  stream: ReadableStream<broker.ProtocolReadResponse>,
): ReadableStream<JsonObject> {
  return stream!
    .pipeThrough(decodeContent())
    .pipeThrough(splitStream("\n"))
    .pipeThrough(parseJSONStream());
}
