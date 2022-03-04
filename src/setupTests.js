import '@testing-library/jest-dom';
import { act, configure } from '@testing-library/react';

// https://github.com/clarkbw/jest-localstorage-mock#in-create-react-app
require('jest-localstorage-mock');

// https://github.com/testing-library/dom-testing-library/issues/552
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

// Cleaning up after our localstorage mock. It requires we disable
//  jest auto cleaning up mocks so we call the clerAllMocks ourselves
afterEach(async () => {
    localStorage.clear();
    jest.clearAllMocks();
});

// Must be LAST so it runs FIRST due to afterEachs running in reverse order
afterEach(() => {
    if (jest.isMockFunction(setTimeout)) {
        act(() => jest.runOnlyPendingTimers());
        jest.useRealTimers();
    }
});
