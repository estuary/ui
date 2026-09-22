import { syncNow } from 'src/api/syncNow';

const encoder = new TextEncoder();
const auth = {
    reactorAddress: 'https://reactor.example/base',
    reactorToken: 'test-token',
};

function response(chunks: string[], status = 200) {
    return new Response(
        new ReadableStream({
            start(controller) {
                chunks.forEach((chunk) =>
                    controller.enqueue(encoder.encode(chunk))
                );
                controller.close();
            },
        }),
        { status }
    );
}

function request() {
    const controller = new AbortController();
    return {
        taskName: 'acme/warehouse',
        authorize: vi.fn().mockResolvedValue(auth),
        signal: controller.signal,
        controller,
        onProgress: vi.fn(),
    };
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

test('posts the exact contract and decodes fragmented, CRLF and final unterminated lines', async () => {
    const fetcher = vi
        .fn()
        .mockResolvedValue(
            response([
                '{"res',
                'ult":{"ack":{}}}\r\n\n{"result":{"heartbeat":{}}}\n{"result":',
                '{"done":{}}}',
            ])
        );
    vi.stubGlobal('fetch', fetcher);
    const args = request();
    await syncNow(args);
    expect(fetcher).toHaveBeenCalledWith(
        new URL('https://reactor.example/v1/task-control/sync-now'),
        expect.objectContaining({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token',
            },
            body: JSON.stringify({ taskName: 'acme/warehouse' }),
        })
    );
    expect(args.onProgress.mock.calls).toEqual([['connecting'], ['waiting']]);
});

test('Ack and heartbeat do not resolve until Done', async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
            new Response(
                new ReadableStream({
                    start(controller) {
                        stream = controller;
                    },
                })
            )
        )
    );
    const args = request();
    let complete = false;
    const promise = syncNow(args).then(() => {
        complete = true;
    });
    stream.enqueue(
        encoder.encode('{"result":{"ack":{}}}\n{"result":{"heartbeat":{}}}\n')
    );
    await vi.waitFor(() =>
        expect(args.onProgress).toHaveBeenCalledWith('waiting')
    );
    expect(complete).toBe(false);
    stream.enqueue(encoder.encode('{"result":{"done":{}}}\n'));
    await promise;
    expect(complete).toBe(true);
});

test.each([5, 7, 16])(
    'surfaces terminal gRPC code %s without retry',
    async (code) => {
        const fetcher = vi.fn().mockResolvedValue(
            response(
                [
                    JSON.stringify({
                        error: { grpcCode: code, message: 'Rejected' },
                    }),
                ],
                403
            )
        );
        vi.stubGlobal('fetch', fetcher);
        await expect(syncNow(request())).rejects.toMatchObject({
            code,
            message: 'Rejected',
        });
        expect(fetcher).toHaveBeenCalledTimes(1);
    }
);

test('does not treat EOF before an acknowledgement as success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([])));
    await expect(syncNow(request())).rejects.toThrow('before sync completion');
});

test('reconnects after acknowledged EOF and transient NotFound, with fresh authorization', async () => {
    vi.useFakeTimers();
    const fetcher = vi
        .fn()
        .mockResolvedValueOnce(response(['{"result":{"ack":{}}}\n']))
        .mockResolvedValueOnce(
            response(['{"error":{"grpcCode":5,"message":"Restarting"}}'], 404)
        )
        .mockResolvedValueOnce(
            response(['{"result":{"ack":{}}}\n{"result":{"done":{}}}\n'])
        );
    vi.stubGlobal('fetch', fetcher);
    const args = request();
    const promise = syncNow(args);
    await vi.runAllTimersAsync();
    await promise;
    expect(args.authorize).toHaveBeenCalledTimes(3);
    expect(args.onProgress).toHaveBeenCalledWith('reconnecting');
});

test.each([4, 14])(
    'retries transient gRPC code %s even before acknowledgement',
    async (code) => {
        vi.useFakeTimers();
        vi.stubGlobal(
            'fetch',
            vi
                .fn()
                .mockResolvedValueOnce(
                    response(
                        [JSON.stringify({ error: { grpcCode: code } })],
                        503
                    )
                )
                .mockResolvedValueOnce(
                    response(['{"result":{"ack":{}}}\n{"result":{"done":{}}}'])
                )
        );
        const args = request();
        const promise = syncNow(args);
        await vi.runAllTimersAsync();
        await promise;
        expect(args.authorize).toHaveBeenCalledTimes(2);
    }
);

test('handles mid-stream errors even when HTTP status is 200', async () => {
    vi.stubGlobal(
        'fetch',
        vi
            .fn()
            .mockResolvedValue(
                response([
                    '{"result":{"ack":{}}}\n{"error":{"grpcCode":7,"message":"Denied"}}\n',
                ])
            )
    );
    await expect(syncNow(request())).rejects.toMatchObject({ code: 7 });
});

test('stopping during backoff prevents subsequent requests', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockRejectedValue(new TypeError('Network failure'));
    vi.stubGlobal('fetch', fetcher);
    const args = request();
    const promise = syncNow(args);
    const assertion = expect(promise).rejects.toMatchObject({
        name: 'AbortError',
    });
    await vi.advanceTimersByTimeAsync(0);
    args.controller.abort();
    await assertion;
    await vi.runAllTimersAsync();
    expect(fetcher).toHaveBeenCalledTimes(1);
});

test('rejects malformed successful responses rather than reporting success', async () => {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(response(['<html>proxy error</html>']))
    );
    await expect(syncNow(request())).rejects.toThrow('invalid sync response');
});

test('a stalled connection times out and reconnects instead of waiting forever', async () => {
    vi.useFakeTimers();
    const fetcher = vi
        .fn()
        .mockImplementationOnce(
            (_url, { signal }: RequestInit) =>
                new Promise((_resolve, reject) => {
                    signal?.addEventListener(
                        'abort',
                        () => reject(new DOMException('Aborted', 'AbortError')),
                        { once: true }
                    );
                })
        )
        .mockResolvedValueOnce(
            response(['{"result":{"ack":{}}}\n{"result":{"done":{}}}\n'])
        );
    vi.stubGlobal('fetch', fetcher);
    const args = request();
    const promise = syncNow(args);
    await vi.advanceTimersByTimeAsync(60000);
    expect(args.onProgress).toHaveBeenCalledWith('reconnecting');
    await vi.advanceTimersByTimeAsync(1000);
    await promise;
    expect(fetcher).toHaveBeenCalledTimes(2);
});

test('retries intermediary HTTP 503 responses with no protocol payload', async () => {
    vi.useFakeTimers();
    const fetcher = vi
        .fn()
        .mockResolvedValueOnce(response(['<html>Unavailable</html>'], 503))
        .mockResolvedValueOnce(response(['{"result":{"done":{}}}\n']));
    vi.stubGlobal('fetch', fetcher);
    const promise = syncNow(request());
    await vi.runAllTimersAsync();
    await promise;
    expect(fetcher).toHaveBeenCalledTimes(2);
});
