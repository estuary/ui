import '@testing-library/jest-dom';
import { act, configure } from '@testing-library/react';

configure({ defaultHidden: true });

// REACT INTL
const hasFullICU = () => {
    // That's the recommended way to test for ICU support according to Node.js docs
    try {
        const january = new Date(9e8);
        const pt = new Intl.DateTimeFormat('pt', { month: 'long' });
        return pt.format(january) === 'janeiro';
    } catch (err) {
        return false;
    }
};

export const setupTests = () => {
    if (hasFullICU()) {
        Intl.NumberFormat.format = new Intl.NumberFormat('pt').format;
        Intl.DateTimeFormat.format = new Intl.DateTimeFormat('pt').format;
    } else {
        global.Intl = () => {
            console.log('hey');
            return 'hey';
        };
    }
};
// REACT INTL

afterEach(async () => {
    // await waitFor(() => expect(queryCache.isFetching).toBe(0));

    if (jest.isMockFunction(setTimeout)) {
        act(() => jest.runOnlyPendingTimers());
        jest.useRealTimers();
    }
});
