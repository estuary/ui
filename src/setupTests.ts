import { cleanup } from '@testing-library/react';
import { server } from 'test/server/test-server';

console.log('tests:setup:start');
vi.mock('zustand');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => server.close());
console.log('tests:setup:end');
