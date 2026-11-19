const MAX_EVENTS = 20;
const FLUSH_INTERVAL_MS = 1000;

export function createSemanticEventBatcher(endpoint: string) {
    let queue: string[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flush = () => {
        clearTimeout(timer);
        timer = undefined;
        if (!queue.length) return;

        const body = `[${queue.join(',')}]`;
        queue = [];

        void (async () => {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'omit',
                    referrerPolicy: 'no-referrer',
                    keepalive: true,
                    body,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
            } catch (error) {
                // No automatic retries: generated webhook IDs don't deduplicate them.
                console.warn(
                    'Could not send semantic interaction events',
                    error
                );
            }
        })();
    };

    const enqueue = (event: Record<string, unknown>) => {
        if (!endpoint) return;

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
        queue.push(serialized);
        if (queue.length >= MAX_EVENTS) {
            flush();
        } else if (timer === undefined) {
            timer = setTimeout(flush, FLUSH_INTERVAL_MS);
        }
    };

    return { enqueue, flush };
}
