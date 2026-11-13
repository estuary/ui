const MAX_EVENTS = 20;
const MAX_BATCH_BYTES = 48 * 1024;
const KEEPALIVE_BUDGET = 64 * 1024;
const FLUSH_INTERVAL_MS = 1000;

export function createSemanticEventBatcher(endpoint: string) {
    const encoder = new TextEncoder();
    let queue: string[] = [];
    let queuedBytes = 2; // JSON array brackets.
    let keepaliveBytes = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flush = () => {
        clearTimeout(timer);
        timer = undefined;
        if (!queue.length) return;

        const body = `[${queue.join(',')}]`;
        const bytes = queuedBytes;
        queue = [];
        queuedBytes = 2;

        // The browser shares a 64 KiB budget across in-flight keepalive requests.
        // Bursts beyond that budget still send, using an ordinary request.
        const keepalive = keepaliveBytes + bytes <= KEEPALIVE_BUDGET;
        if (keepalive) keepaliveBytes += bytes;

        void (async () => {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'omit',
                    keepalive,
                    body,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
            } catch (error) {
                // No automatic retries: generated webhook IDs don't deduplicate them.
                console.warn(
                    'Could not send semantic interaction events',
                    error
                );
            } finally {
                if (keepalive) keepaliveBytes -= bytes;
            }
        })();
    };

    const enqueue = (event: Record<string, unknown>) => {
        let serialized: string;
        try {
            // Snapshot metadata now, before navigation or auth state can change.
            serialized = JSON.stringify(event);
        } catch (error) {
            console.warn(
                'Could not serialize semantic interaction event',
                error
            );
            return;
        }
        const bytes = encoder.encode(serialized).byteLength;
        if (bytes + 2 > MAX_BATCH_BYTES) {
            console.warn(
                'Semantic interaction event exceeds the batch size limit'
            );
            return;
        }
        if (queuedBytes + bytes + (queue.length ? 1 : 0) > MAX_BATCH_BYTES) {
            flush();
        }
        queuedBytes += bytes + (queue.length ? 1 : 0);
        queue.push(serialized);
        if (queue.length >= MAX_EVENTS || queuedBytes >= MAX_BATCH_BYTES) {
            flush();
        } else if (timer === undefined) {
            timer = setTimeout(flush, FLUSH_INTERVAL_MS);
        }
    };

    return { enqueue, flush };
}
