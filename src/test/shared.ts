import { vi } from 'vitest';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// jsdom AbortSignals are incompatible with Node's fetch implementation.
export const dropFetchSignals = () => {
    const fetchTransport = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) =>
        fetchTransport(input, { ...init, signal: undefined })
    );
};
