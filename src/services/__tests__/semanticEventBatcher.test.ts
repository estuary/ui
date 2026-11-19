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
    it('does not serialize, queue, or send events without an endpoint', () => {
        const batcher = createSemanticEventBatcher('');
        const toJSON = vi.fn(() => ({ path: 'disabled' }));
        for (let i = 0; i < 25; i++) batcher.enqueue({ toJSON });

        expect(toJSON).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
        batcher.flush();
        vi.advanceTimersByTime(1000);
        expect(fetchMock).not.toHaveBeenCalled();
    });

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
        expect(fetchMock.mock.calls[0][0]).toBe('/events');
        expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([
            { metadata: { page: '/first' } },
            { path: 'second' },
        ]);
    });

    it('flushes at 20 events without a duplicate timer flush', () => {
        fetchMock.mockImplementation(() => new Promise(() => {}));
        const batcher = createSemanticEventBatcher('/events');
        for (let i = 0; i < 40; i++) {
            batcher.enqueue({ i, text: '🙂'.repeat(1000) });
        }
        expect(fetchMock).toHaveBeenCalledTimes(2);
        for (const [, options] of fetchMock.mock.calls) {
            expect(JSON.parse(options.body)).toHaveLength(20);
            expect(options.keepalive).toBe(true);
        }
        vi.advanceTimersByTime(1000);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('flushes pending events once when explicitly requested', () => {
        const batcher = createSemanticEventBatcher('/events');
        batcher.enqueue({ path: 'close' });
        batcher.flush();
        batcher.flush();
        vi.advanceTimersByTime(1000);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
    });

    it('isolates unserializable events', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const batcher = createSemanticEventBatcher('/events');
        const cyclic: Record<string, unknown> = {};
        cyclic.self = cyclic;
        batcher.enqueue(cyclic);
        batcher.enqueue({ path: 'valid' });
        batcher.flush();
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([
            { path: 'valid' },
        ]);
    });
});
