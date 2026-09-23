export type SyncNowProgress = 'connecting' | 'waiting' | 'reconnecting';

interface Authorization {
    reactorAddress: string;
    reactorToken: string;
}

export class SyncNowError extends Error {
    constructor(
        message: string,
        readonly code?: number,
        readonly retryable = false
    ) {
        super(message);
    }
}

// These are gRPC codes, not HTTP statuses. NotFound is transient only after
// an acknowledgement has proved the task exists (a replacement leader may
// not yet be addressable).
const retryableCode = (code: number | undefined, acknowledged: boolean) =>
    code === 14 || code === 4 || (code === 5 && acknowledged);

function delay(ms: number, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        signal.throwIfAborted();
        const abort = () => {
            clearTimeout(timer);
            reject(signal.reason);
        };
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', abort);
            resolve();
        }, ms);
        signal.addEventListener('abort', abort, { once: true });
    });
}

/** Resolve only on Done, never on HTTP 200, Ack, heartbeat, or EOF. */
export async function syncNow({
    taskName,
    authorize,
    signal,
    onProgress,
}: {
    taskName: string;
    authorize: () => Promise<Authorization>;
    signal: AbortSignal;
    onProgress: (progress: SyncNowProgress) => void;
}): Promise<void> {
    let acknowledged = false;
    let backoff = 1000;
    onProgress('connecting');

    while (true) {
        signal.throwIfAborted();
        // Refresh authorization on every attempt, including after token expiry.
        const authorization = await authorize();
        signal.throwIfAborted();
        const controller = new AbortController();
        const abort = () => controller.abort(signal.reason);
        signal.addEventListener('abort', abort, { once: true });
        let timer: ReturnType<typeof setTimeout>;
        const resetTimeout = () => {
            clearTimeout(timer);
            timer = setTimeout(() => controller.abort(), 60000);
        };
        resetTimeout();
        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
        try {
            const response = await fetch(
                new URL(
                    '/v1/task-control/sync-now',
                    authorization.reactorAddress
                ),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authorization.reactorToken}`,
                    },
                    body: JSON.stringify({ taskName }),
                    signal: controller.signal,
                }
            );
            if (!response.body) {
                throw new SyncNowError(
                    'The sync response was empty.',
                    undefined,
                    response.status >= 500
                );
            }
            reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            const processLine = (line: string) => {
                if (!line.trim()) return false;
                let message;
                try {
                    message = JSON.parse(line);
                } catch {
                    throw new SyncNowError(
                        'The server returned an invalid sync response.',
                        undefined,
                        response.status >= 500
                    );
                }
                if (message?.error) {
                    throw new SyncNowError(
                        message.error.message ?? 'The sync request failed.',
                        message.error.grpcCode,
                        retryableCode(message.error.grpcCode, acknowledged)
                    );
                }
                if (!response.ok) {
                    throw new SyncNowError(
                        `Sync request failed (HTTP ${response.status}).`,
                        undefined,
                        response.status >= 500
                    );
                }
                if (message?.result?.ack) {
                    acknowledged = true;
                    backoff = 1000;
                    onProgress('waiting');
                }
                return Boolean(message?.result?.done);
            };
            while (true) {
                const { value, done } = await reader.read();
                signal.throwIfAborted();
                resetTimeout();
                buffer += decoder.decode(value, { stream: !done });
                let newline;
                while ((newline = buffer.indexOf('\n')) >= 0) {
                    const line = buffer.slice(0, newline);
                    buffer = buffer.slice(newline + 1);
                    if (processLine(line)) return;
                }
                if (done) {
                    if (processLine(buffer)) return;
                    throw new SyncNowError(
                        'The connection closed before sync completion was confirmed.',
                        undefined,
                        acknowledged || response.status >= 500
                    );
                }
            }
        } catch (error) {
            signal.throwIfAborted();
            if (error instanceof SyncNowError && !error.retryable) throw error;
            // Fetch failures, stalled streams, and transient leader errors are
            // safe to retry: SyncNow is idempotent.
        } finally {
            clearTimeout(timer!);
            signal.removeEventListener('abort', abort);
            controller.abort();
            await reader?.cancel().catch(() => undefined);
            reader?.releaseLock();
        }
        signal.throwIfAborted();
        onProgress('reconnecting');
        await delay(backoff, signal);
        backoff = Math.min(backoff * 2, 30000);
    }
}
