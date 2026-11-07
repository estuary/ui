import { cleanup, configure } from '@testing-library/react';

import invariableStores from 'src/context/Zustand/invariableStores';
import { server } from 'src/test/server/test-server';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('zustand');

// https://github.com/testing-library/dom-testing-library/issues/552
configure({ defaultHidden: true });

beforeAll(async () => {
    // This is just marked so the stores will be created
    invariableStores;
    server.listen({ onUnhandledRequest: 'error' });
});

// flip-toolkit checks reduced motion through matchMedia, which jsdom lacks.
beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
});

afterEach(() => {
    server.resetHandlers();
    cleanup();
    vi.unstubAllGlobals();
});

afterAll(() => server.close());
