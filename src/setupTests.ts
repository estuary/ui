import { cleanup } from '@testing-library/react';
import { server } from 'test/server/test-server';

vi.mock('zustand');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => server.close());
