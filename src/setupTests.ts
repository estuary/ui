import { cleanup } from '@testing-library/react';
import { server } from 'test/server/test-server';

vi.mock('zustand');
vi.mock('context/Router/RequireAuth');

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => server.close());
