import { cleanup } from '@testing-library/react';
import { server } from 'test/server/test-server';

vi.mock('zustand');

beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => server.close());
