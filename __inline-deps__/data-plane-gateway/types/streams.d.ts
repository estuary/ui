export declare function splitStream(splitOn: string): TransformStream;
export declare function parseJSONStream(): TransformStream<any, any>;
export declare function unwrapResult(): TransformStream<any, any>;
export declare function decodeContent(): TransformStream<any, any>;
export declare function readStreamToEnd<T>(stream: ReadableStream<T>): Promise<Array<T>>;
