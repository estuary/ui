import { cleanup } from '@testing-library/react';
import { server } from 'test/server/test-server';

vi.mock('zustand');
vi.mock('context/Client');
vi.mock('context/User');

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => server.close());
