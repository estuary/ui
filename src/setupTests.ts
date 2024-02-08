import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from 'test/server/test-server';

// Setup zustand mocks. This also resets stores in its own afterEach
vi.mock('zustand');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => server.close());
