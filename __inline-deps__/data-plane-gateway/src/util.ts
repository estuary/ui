import * as broker from "./gen/broker/protocol/broker.js";
import { Result } from "./result.js";

export type JsonObject = Record<string, unknown>;

export function trimUrl(orig: URL): string {
  let url = orig.toString();
  if (url.endsWith("/")) {
    url = url.slice(0, url.length - 1);
  }
  return url;
}

export async function doFetch(
    url: string,
    authToken: string,
    body: unknown,
  ): Promise<Result<Response, Response>> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return Result.Ok(response);
      } else {
        return Result.Err(response);
      }
    } catch (response) {
      return Result.Err(response);
    }
  }

/// Transforms Unary and Stream errors into a similar structure.
export class ResponseError {
  readonly body: broker.RuntimeError | broker.RuntimeStreamError;
  readonly response: Response;
  readonly status: string;

  private constructor(
    body: broker.RuntimeError | broker.RuntimeStreamError,
    response: Response,
    status: string,
  ) {
    this.body = body;
    this.response = response;
    this.status = status;
  }

  static async fromResponse(response: Response): Promise<ResponseError> {
    const body = await response.json();
    const status = body.code;

    return new ResponseError(body, response, status);
  }

  static async fromStreamResponse(response: Response): Promise<ResponseError> {
    const body = await response.json();
    const status = body.error.httpStatus;

    return new ResponseError(body.error, response, status);
  }
}

export type sortFn<T> = (a: T, b: T) => number;

export function sortBy<T, K extends keyof T>(...fields: Array<K>): sortFn<T> {
  return (a, b) => {

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (a[field] > b[field]) {
        return 1;
      } else if (a[field] < b[field]) {
        return -1;
      } else {
        // a and b have the same field values. Try the next field.
      }
    }

    // a and b are equal across all fields
    return 0;
  };
}
