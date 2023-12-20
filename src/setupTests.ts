import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from 'test/server/test-server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => server.close());
