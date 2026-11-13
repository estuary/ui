import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSemanticEventBatcher } from 'src/services/semanticEventBatcher';

const fetchMock = vi.fn();

beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('semantic event batching', () => {
    it('snapshots events and sends one array after a second', () => {
        const batcher = createSemanticEventBatcher('/events');
        const event = { metadata: { page: '/first' } };
        batcher.enqueue(event);
        event.metadata.page = '/second';
        batcher.enqueue({ path: 'second' });
        vi.advanceTimersByTime(999);
        expect(fetchMock).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([
            { metadata: { page: '/first' } },
            { path: 'second' },
        ]);
    });

    it('flushes at 20 events without a duplicate timer flush', () => {
        const batcher = createSemanticEventBatcher('/events');
        for (let i = 0; i < 20; i++) batcher.enqueue({ i });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toHaveLength(20);
        vi.advanceTimersByTime(1000);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('splits by UTF-8 bytes and respects the shared keepalive budget', () => {
        fetchMock.mockImplementation(() => new Promise(() => {}));
        const batcher = createSemanticEventBatcher('/events');
        for (let i = 0; i < 3; i++) {
            batcher.enqueue({ text: '🙂'.repeat(9000) });
        }
        batcher.flush();
        expect(fetchMock).toHaveBeenCalledTimes(3);
        for (const [, options] of fetchMock.mock.calls) {
            expect(
                new TextEncoder().encode(options.body).byteLength
            ).toBeLessThanOrEqual(48 * 1024);
        }
        expect(
            fetchMock.mock.calls.map(([, options]) => options.keepalive)
        ).toEqual([true, false, false]);
    });

    it('flushes pending events once when explicitly requested', () => {
        const batcher = createSemanticEventBatcher('/events');
        batcher.enqueue({ path: 'close' });
        batcher.flush();
        batcher.flush();
        vi.advanceTimersByTime(1000);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('isolates oversized and unserializable events', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const batcher = createSemanticEventBatcher('/events');
        const cyclic: Record<string, unknown> = {};
        cyclic.self = cyclic;
        batcher.enqueue(cyclic);
        batcher.enqueue({ text: 'x'.repeat(48 * 1024) });
        batcher.enqueue({ path: 'valid' });
        batcher.flush();
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([
            { path: 'valid' },
        ]);
    });
});
